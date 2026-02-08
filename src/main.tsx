import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import FlowApp from "./FlowApp";
import "bootstrap-icons/font/bootstrap-icons.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlowApp />
  </StrictMode>,
);
