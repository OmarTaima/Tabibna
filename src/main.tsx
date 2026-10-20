import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "./i18n/locale-provider";
import { trackServiceWorkerRegistration } from "./lib/notifications";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found.");
}

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  // Registered as early as possible so the worker is active and controlling the
  // page before the first alarm fires; skipWaiting() and clients.claim() in the
  // worker take over the open page instead of waiting for the next load.
  trackServiceWorkerRegistration(
    navigator.serviceWorker.register("/sw.js").catch(() => null),
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
);
