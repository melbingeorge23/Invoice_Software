import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "14px",
          background: "#0f172a",
          color: "#fff",
          fontWeight: "600"
        },
        success: {
          style: {
            background: "#166534"
          }
        },
        error: {
          style: {
            background: "#991b1b"
          }
        }
      }}
    />
  </StrictMode>
);