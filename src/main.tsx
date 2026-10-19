import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initBrowserCompat } from "./utils/browserCompat";

// Cross-browser boot: Safari / Chrome / Firefox / Edge / Samsung Internet
// Android phones, iPhones, HP/Windows laptops, tablets
const disposeCompat = initBrowserCompat();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Hot-dispose in dev if needed
if (import.meta && (import.meta as ImportMeta & { hot?: { dispose: (cb: () => void) => void } }).hot) {
  (import.meta as ImportMeta & { hot: { dispose: (cb: () => void) => void } }).hot.dispose(() => {
    disposeCompat();
  });
}
