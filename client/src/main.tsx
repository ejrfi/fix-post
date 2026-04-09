import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  registerSW({ immediate: true });
}
