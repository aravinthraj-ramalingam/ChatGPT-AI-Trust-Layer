import { useState } from "react";
import { getApiKey, setApiKey, getBaseUrl, setBaseUrl, getModel, setModel } from "../lib/judgment-service.js";
import "./SettingsDialog.css";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Modal for configuring OpenAI API settings */
export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [baseUrl, setBaseUrlState] = useState(getBaseUrl());
  const [model, setModelState] = useState(getModel());
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  function handleSave() {
    setApiKey(apiKey.trim());
    setBaseUrl(baseUrl.trim() || "https://api.openai.com/v1");
    setModel(model.trim() || "gpt-4o-mini");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="settings-overlay" onKeyDown={handleKeyDown} role="dialog" aria-label="Settings">
      <div className="settings-dialog">
        <div className="settings-dialog__header">
          <h3>Settings</h3>
          <button type="button" className="settings-dialog__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-dialog__body">
          <label className="settings-field">
            <span>API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="sk-..."
              autoFocus
            />
          </label>

          <label className="settings-field">
            <span>Base URL</span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrlState(e.target.value)}
              placeholder="https://api.openai.com/v1"
            />
          </label>

          <label className="settings-field">
            <span>Model</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModelState(e.target.value)}
              placeholder="gpt-4o-mini"
            />
          </label>
        </div>

        <div className="settings-dialog__footer">
          {saved && <span className="settings-dialog__saved">Saved!</span>}
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
