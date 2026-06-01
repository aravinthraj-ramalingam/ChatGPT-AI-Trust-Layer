import { useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage.js";
import { SettingsDialog } from "./components/SettingsDialog.js";
import "./styles/app.css";

/** App shell — ChatGPT-style header */
export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/chat" className="app-header__brand">
            ChatGPT AI Trust Layer
            <span className="app-header__chevron" aria-hidden="true">
              ▾
            </span>
          </Link>
          <div className="app-header__actions">
            <Link to="/chat" className="btn-ghost" style={{ textDecoration: "none" }}>
              Chat
            </Link>
            <button
              type="button"
              className="btn-ghost app-header__settings-btn"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              title="Settings"
            >
              ⚙
            </button>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </BrowserRouter>
  );
}
