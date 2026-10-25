import assert from "node:assert/strict";
import {
  getServiceWorkerRegistration,
  showAlarmNotification,
  trackServiceWorkerRegistration,
} from "./notifications";

type NotificationCall = {
  title: string;
  options: NotificationOptions | undefined;
};

type FakeRegistration = {
  showNotification: (
    title: string,
    options?: NotificationOptions,
  ) => Promise<void>;
};

class NotificationStub {
  static permission: NotificationPermission = "granted";
  static instances: Array<{
    title: string;
    options: NotificationOptions | undefined;
  }> = [];

  constructor(title: string, options?: NotificationOptions) {
    NotificationStub.instances.push({ title, options });
  }
}

function installGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
}

function tick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

const workerCalls: NotificationCall[] = [];
let shouldReject = false;
let currentRegistration: FakeRegistration | undefined;
let getRegistrationCalls = 0;
let readyPromise: Promise<never> = new Promise<never>(() => {});

const registration: FakeRegistration = {
  showNotification: (title, options) => {
    workerCalls.push({ title, options });

    return shouldReject
      ? Promise.reject(new Error("worker cannot show the notification"))
      : Promise.resolve();
  },
};

const serviceWorkerStub = {
  getRegistration: () => {
    getRegistrationCalls += 1;
    return Promise.resolve(currentRegistration);
  },
  get ready() {
    return readyPromise;
  },
};

try {
  installGlobal("navigator", {});
  assert.equal(
    await getServiceWorkerRegistration(),
    null,
    "a lookup without the service worker API resolves to null",
  );
  passed("lookup degrades gracefully without the Service Worker API");

  installGlobal("navigator", { serviceWorker: serviceWorkerStub });
  trackServiceWorkerRegistration(
    new Promise<ServiceWorkerRegistration | null>(() => {}),
  );
  assert.equal(
    await getServiceWorkerRegistration(),
    null,
    "an in-flight registration that never settles times out to null",
  );
  passed("an in-flight registration that times out resolves to null");

  trackServiceWorkerRegistration(Promise.resolve(null));
  currentRegistration = undefined;
  assert.equal(
    await getServiceWorkerRegistration(),
    null,
    "a lookup with no registration resolves to null",
  );
  passed("a failed lookup resolves to null");

  currentRegistration = registration;
  const resolved = await getServiceWorkerRegistration();
  assert.equal(
    resolved,
    registration,
    "the registration is found on the next lookup because the failure was not cached",
  );
  passed("a failed lookup is not permanently cached");

  const callsBefore = getRegistrationCalls;
  assert.equal(
    await getServiceWorkerRegistration(),
    registration,
    "a resolved registration is reused",
  );
  assert.equal(
    getRegistrationCalls,
    callsBefore,
    "a cached registration skips another lookup",
  );
  passed("a resolved registration is cached and reused");

  installGlobal("Notification", NotificationStub);
  showAlarmNotification("Time for your medicine", "Reminder for Vitamin D");
  await tick();
  assert.equal(workerCalls.length, 1, "the service worker shows the notification");
  assert.equal(workerCalls[0].title, "Time for your medicine");
  assert.equal(workerCalls[0].options?.body, "Reminder for Vitamin D");
  assert.equal(workerCalls[0].options?.tag, "vivavalve-medicine-reminder");
  assert.equal(workerCalls[0].options?.requireInteraction, true);
  assert.equal(
    NotificationStub.instances.length,
    0,
    "no page notification is created while the worker handles it",
  );
  passed("the service worker path shows the alarm notification");

  shouldReject = true;
  showAlarmNotification("Time for your medicine", "Reminder for Vitamin D");
  await tick();
  assert.equal(
    NotificationStub.instances.length,
    1,
    "a rejected worker notification falls back to the page notification",
  );
  assert.equal(NotificationStub.instances[0].title, "Time for your medicine");
  passed("a rejected worker notification falls back to the page notification");

  NotificationStub.permission = "denied";
  showAlarmNotification("Time for your medicine", "Reminder for Vitamin D");
  await tick();
  assert.equal(workerCalls.length, 2, "nothing is shown without permission");
  assert.equal(NotificationStub.instances.length, 1);
  passed("no notification is shown without permission");

  console.log("All client notification tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
