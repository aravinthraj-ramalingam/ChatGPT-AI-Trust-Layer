import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage.js";
import { LandingPage } from "./pages/LandingPage.js";
import "./styles/app.css";

/** App shell — ChatGPT-style header */
export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <Link to="/chat" className="app-header__brand">
            Trust Through Judgment
            <span className="app-header__chevron" aria-hidden="true">
              ▾
            </span>
          </Link>
          <div className="app-header__actions">
            <Link to="/chat" className="btn-ghost" style={{ textDecoration: "none" }}>
              Chat
            </Link>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
