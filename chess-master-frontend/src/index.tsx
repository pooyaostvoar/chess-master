import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/common.css";
import "./styles/layout.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./contexts/UserContext";

const container = document.getElementById("root") as HTMLElement;
const tree = (
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);

// react-snap prerenders each route to static HTML at build time. When that
// markup is present we hydrate it (so crawlers see real content and the client
// attaches to it); otherwise we render fresh.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, tree);
} else {
  ReactDOM.createRoot(container).render(tree);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(console.error);
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
