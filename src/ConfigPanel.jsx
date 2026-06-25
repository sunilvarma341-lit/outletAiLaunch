import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getConfig, updateConfig, resetConfig } from "./config";
import { getLaunchStats, getAppLaunches, downloadAnalytics, clearTrackingData } from "./analytics";
import appIcon from "./assets/outletAi.png";
import "./ConfigPanel.css";

export default function ConfigPanel() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(getLaunchStats());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("settings"); // settings, analytics

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getLaunchStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    if (confirm("Reset all settings to defaults?")) {
      const defaultConfig = await resetConfig();
      setConfig(defaultConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleResetLaunchStatus = async () => {
    if (confirm("Reset launch status? The director's page will show \"Go Live\" again.")) {
      const updated = await updateConfig({ lastSignaledAt: null });
      setConfig(updated);
    }
  };

  const handleClearData = () => {
    if (confirm("Clear all tracking data? This cannot be undone.")) {
      clearTrackingData();
      setStats(getLaunchStats());
    }
  };

  if (!config) {
    return (
      <div className="config-page">
        <div className="loader" />
      </div>
    );
  }

  const recentLaunches = getAppLaunches().slice(-10).reverse();

  return (
    <div className="config-page">
      <div className="config-glow" />

      <header className="config-topbar">
        <div className="config-brand">
          <img src={appIcon} alt="" className="config-brand-logo" />
          <div>
            <h1>Console</h1>
            <p>{config.appName}</p>
          </div>
        </div>
        <button className="back-button" onClick={() => navigate("/")}>
          &larr; Launch Page
        </button>
      </header>

      <div className="config-shell">
        <div className="config-tabs">
          <button
            className={`tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={`tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Activity
          </button>
        </div>

        {activeTab === "settings" && (
          <div className="config-content">
            <section className="config-section">
              <h2>App Information</h2>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>App Name</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) => handleConfigChange("appName", e.target.value)}
                  />
                </div>

                <div className="config-field full-width">
                  <label>App Subtitle</label>
                  <input
                    type="text"
                    value={config.appSubtitle}
                    onChange={(e) => handleConfigChange("appSubtitle", e.target.value)}
                  />
                </div>

                <div className="config-field full-width">
                  <label>Play Store URL</label>
                  <input
                    type="url"
                    value={config.playStoreUrl}
                    onChange={(e) => handleConfigChange("playStoreUrl", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="config-section">
              <h2>Launch Status</h2>
              <p className="field-hint">
                {config.lastSignaledAt
                  ? `Currently showing "Live" since ${new Date(config.lastSignaledAt).toLocaleString()}. The go-live signal is written straight to Firestore — check here, then publish the change in Play Console.`
                  : "Currently showing \"Go Live\" (not yet launched)."}
              </p>
              <button className="btn-outline" onClick={handleResetLaunchStatus}>
                Reset Launch Status
              </button>
            </section>

            <div className="config-actions">
              <button className="btn-primary" onClick={handleSave}>
                {saved ? "Saved" : "Save Configuration"}
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                Reset to Defaults
              </button>
              <button
                className="btn-preview"
                onClick={() => {
                  handleSave();
                  setTimeout(() => navigate("/"), 300);
                }}
              >
                Save & Preview
              </button>
            </div>

            <p className="last-updated">
              Last updated: {new Date(config.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="config-content">
            <section className="config-section">
              <h2>Launch Activity</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Launches</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {stats.lastLaunch ? new Date(stats.lastLaunch).toLocaleString() : "—"}
                  </div>
                  <div className="stat-label">Last Launch</div>
                </div>
              </div>
            </section>

            <section className="config-section">
              <h2>Recent Activity</h2>
              {recentLaunches.length > 0 ? (
                <div className="activity-list">
                  {recentLaunches.map((launch, idx) => (
                    <div key={idx} className="activity-item">
                      <span className="activity-source">Go Live</span>
                      <span className="activity-time">
                        {new Date(launch.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No activity yet</p>
              )}
            </section>

            <div className="config-actions">
              <button className="btn-primary" onClick={downloadAnalytics}>
                Download CSV Report
              </button>
              <button className="btn-danger" onClick={handleClearData}>
                Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
