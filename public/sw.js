// Minimal notification-only service worker: it never caches and never intercepts fetch.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList[0];

        if (existing && "focus" in existing) {
          return existing.focus();
        }

        return self.clients.openWindow("/");
      })
      .catch(() => undefined),
  );
});
