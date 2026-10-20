type AudioContextConstructor = new () => AudioContext;

type Voice = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

const TONE_FREQUENCIES = [880, 660] as const;
const TONE_ON_MS = 400;
const TONE_OFF_MS = 200;
const TONE_GAIN = 0.32;
const MAX_RING_MS = 60_000;

let audioContext: AudioContext | null = null;
let voices: Voice[] = [];
let toneTimer: number | null = null;
let ringTimer: number | null = null;
let isRinging = false;
let visibilityListenerAttached = false;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const scope = window as unknown as {
    AudioContext?: AudioContextConstructor;
    webkitAudioContext?: AudioContextConstructor;
  };

  if (typeof scope.AudioContext === "function") {
    return scope.AudioContext;
  }

  if (typeof scope.webkitAudioContext === "function") {
    return scope.webkitAudioContext;
  }

  return null;
}

function ensureContext(): AudioContext | null {
  if (audioContext) {
    return audioContext;
  }

  const Constructor = getAudioContextConstructor();
  if (!Constructor) {
    return null;
  }

  try {
    audioContext = new Constructor();
  } catch {
    audioContext = null;
  }

  return audioContext;
}

function resumeContext(context: AudioContext): void {
  if (context.state !== "suspended") {
    return;
  }

  void context.resume().catch(() => undefined);
}

function attachVisibilityListener(): void {
  if (visibilityListenerAttached || typeof document === "undefined") {
    return;
  }

  visibilityListenerAttached = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || !audioContext) {
      return;
    }

    resumeContext(audioContext);
  });
}

function playTone(
  context: AudioContext,
  frequency: number,
  durationMs: number,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime;
  const duration = durationMs / 1000;
  const attack = 0.03;
  const release = 0.06;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(TONE_GAIN, startAt + attack);
  gain.gain.setValueAtTime(TONE_GAIN, startAt + Math.max(attack, duration - release));
  gain.gain.linearRampToValueAtTime(0, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  const voice: Voice = { oscillator, gain };
  voices.push(voice);

  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    voices = voices.filter((item) => item !== voice);
  };

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

export function unlockAudio(): void {
  const context = ensureContext();
  if (!context) {
    return;
  }

  resumeContext(context);
  attachVisibilityListener();
}

export function startRinging(): void {
  if (isRinging) {
    return;
  }

  const context = ensureContext();
  if (!context) {
    return;
  }

  resumeContext(context);
  isRinging = true;

  let toneIndex = 0;

  const playNextTone = () => {
    if (!isRinging) {
      return;
    }

    const frequency = TONE_FREQUENCIES[toneIndex % TONE_FREQUENCIES.length];
    toneIndex += 1;
    playTone(context, frequency, TONE_ON_MS);
    toneTimer = window.setTimeout(playNextTone, TONE_ON_MS + TONE_OFF_MS);
  };

  playNextTone();
  ringTimer = window.setTimeout(() => {
    stopRinging();
  }, MAX_RING_MS);
}

export function stopRinging(): void {
  isRinging = false;

  if (toneTimer !== null) {
    window.clearTimeout(toneTimer);
    toneTimer = null;
  }

  if (ringTimer !== null) {
    window.clearTimeout(ringTimer);
    ringTimer = null;
  }

  for (const voice of voices) {
    try {
      voice.oscillator.stop();
    } catch {
      // The oscillator may already have stopped on its own.
    }

    voice.oscillator.disconnect();
    voice.gain.disconnect();
  }

  voices = [];
}
