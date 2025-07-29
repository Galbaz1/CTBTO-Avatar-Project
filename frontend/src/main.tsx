import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CVIProvider } from "./components/cvi/components/cvi-provider";
import { StagewiseToolbar } from "@stagewise/toolbar-react";

// Render the main app
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CVIProvider>
      <App />
    </CVIProvider>
  </StrictMode>,
);

// Initialize Stagewise toolbar separately
const toolbarConfig = {
  plugins: [], // Add your custom plugins here
};

document.addEventListener("DOMContentLoaded", () => {
  const toolbarRoot = document.createElement("div");
  toolbarRoot.id = "stagewise-toolbar-root"; // Ensure a unique ID
  document.body.appendChild(toolbarRoot);

  createRoot(toolbarRoot).render(
    <StrictMode>
      <StagewiseToolbar config={toolbarConfig} />
    </StrictMode>,
  );
});
