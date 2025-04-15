// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css"; // Tailwind or global styles
import AppState from "./context/AppState";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppState>
      <Router>
        <App />
      </Router>
    </AppState>
  </React.StrictMode>
);
