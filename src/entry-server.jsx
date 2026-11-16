import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

/** Build-time render of the first view (see prerender.mjs); the client hydrates it. */
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
