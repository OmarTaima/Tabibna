export type NotificationState = NotificationPermission | "unsupported";

const REGISTRATION_TIMEOUT_MS = 1_500;

let cachedRegistration: ServiceWorkerRegistration | null = null;
let inFlightRegistration: Promise<ServiceWorkerRegistration | null> | null = null;

function hasServiceWorkerSupport(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

function isNotificationSupported(): boolean {
  return typeof Notification !== "undefined";
}

export function notificationPermission(): NotificationState {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationState> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function trackServiceWorkerRegistration(
  registration: Promise<ServiceWorkerRegistration | null>,
): void {
  inFlightRegistration = registration.then(
    (value) => {
      if (value) {
        cachedRegistration = value;
      } else {
        inFlightRegistration = null;
      }

      return value;
    },
    () => {
      inFlightRegistration = null;
      return null;
    },
  );
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!hasServiceWorkerSupport()) {
    return null;
  }

  if (cachedRegistration) {
    return cachedRegistration;
  }

  // getRegistration() resolves right away with the registration for this scope.
  const registered = await navigator.serviceWorker
    .getRegistration()
    .catch(() => undefined);

  if (registered) {
    cachedRegistration = registered;
    return registered;
  }

  // Nothing is registered yet, so only wait when a registration is in flight.
  if (!inFlightRegistration) {
    return null;
  }

  const pending = await Promise.race([
    navigator.serviceWorker.ready.then(
      (registration) => registration,
      () => null,
    ),
    new Promise<null>((resolve) => {
      globalThis.setTimeout(() => resolve(null), REGISTRATION_TIMEOUT_MS);
    }),
  ]);

  if (pending) {
    cachedRegistration = pending;
  }

  return pending;
}

function showFallbackNotification(
  title: string,
  options: NotificationOptions,
): void {
  try {
    new Notification(title, options);
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}

export function showAlarmNotification(title: string, body: string): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  const options: NotificationOptions = {
    body,
    tag: "vivavalve-medicine-reminder",
    icon: "/favicon.svg",
    requireInteraction: true,
  };

  void getServiceWorkerRegistration().then((registration) => {
    if (!registration) {
      showFallbackNotification(title, options);
      return;
    }

    registration.showNotification(title, options).catch(() => {
      showFallbackNotification(title, options);
    });
  });
}
