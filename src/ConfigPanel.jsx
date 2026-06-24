import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getConfig, updateConfig, resetConfig } from "./config";
import {
  getLaunchStats,
  getAppLaunches,
  downloadAnalytics,
  clearTrackingData,
} from "./analytics";
import "./ConfigPanel.css";

export default function ConfigPanel() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(getConfig());
  const [stats, setStats] = useState(getLaunchStats());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("settings"); // settings, analytics

  useEffect(() => {
    // Refresh stats periodically
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

  const handleReset = () => {
    if (confirm("Reset to default settings?")) {
      const defaultConfig = resetConfig();
      setConfig(defaultConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClearData = () => {
    if (confirm("Clear all tracking data? This cannot be undone.")) {
      clearTrackingData();
      setStats(getLaunchStats());
    }
  };

  const recentLaunches = getAppLaunches().slice(-10).reverse();

  return (
    <div className="config-container">
      <div className="config-panel">
        {/* Header */}
        <div className="config-header">
          <div>
            <h1>⚙️ Configuration Panel</h1>
            <p className="config-subtitle">
              Reviewer & Admin Settings for KiranaGoLive
            </p>
          </div>
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Launch Page
          </button>
        </div>

        {/* Tabs */}
        <div className="config-tabs">
          <button
            className={`tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="tab-icon">⚙️</span>
            Settings
          </button>
          <button
            className={`tab ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <span className="tab-icon">📊</span>
            Analytics
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="config-content">
            {/* Countdown Settings */}
            <section className="config-section">
              <h2>⏱️ Countdown Settings</h2>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>Launch Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={config.launchStartTime}
                    onChange={(e) =>
                      handleConfigChange("launchStartTime", e.target.value)
                    }
                  />
                  <span className="field-hint">
                    Select the local date/time when countdown should begin
                  </span>
                </div>

                <div className="config-field">
                  <label>Countdown Duration (seconds)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.countdownDuration}
                    onChange={(e) =>
                      handleConfigChange(
                        "countdownDuration",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <span className="field-hint">
                    Countdown length after start time (1-60 seconds)
                  </span>
                </div>

                <div className="config-field">
                  <label>Auto Launch</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="autoLaunch"
                      checked={config.autoLaunch}
                      onChange={(e) =>
                        handleConfigChange("autoLaunch", e.target.checked)
                      }
                    />
                    <label htmlFor="autoLaunch" className="toggle-label">
                      <span className="toggle-inner" />
                      <span className="toggle-switch-button" />
                    </label>
                  </div>
                  <span className="field-hint">
                    Automatically launch app after countdown
                  </span>
                </div>

                <div className="config-field">
                  <label>Deep Link Delay (ms)</label>
                  <input
                    type="number"
                    min="500"
                    max="5000"
                    step="100"
                    value={config.deepLinkDelay}
                    onChange={(e) =>
                      handleConfigChange(
                        "deepLinkDelay",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <span className="field-hint">
                    Wait time before fallback to Play Store
                  </span>
                </div>
              </div>
            </section>

            {/* App Information */}
            <section className="config-section">
              <h2>📱 App Information</h2>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>App Name</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) =>
                      handleConfigChange("appName", e.target.value)
                    }
                  />
                </div>

                <div className="config-field full-width">
                  <label>App Subtitle</label>
                  <input
                    type="text"
                    value={config.appSubtitle}
                    onChange={(e) =>
                      handleConfigChange("appSubtitle", e.target.value)
                    }
                  />
                </div>

                <div className="config-field full-width">
                  <label>Play Store URL</label>
                  <input
                    type="url"
                    value={config.playStoreUrl}
                    onChange={(e) =>
                      handleConfigChange("playStoreUrl", e.target.value)
                    }
                  />
                  <span className="field-hint">
                    Full Google Play Store link
                  </span>
                </div>

                <div className="config-field full-width">
                  <label>Deep Link URL</label>
                  <input
                    type="text"
                    value={config.deepLinkUrl}
                    onChange={(e) =>
                      handleConfigChange("deepLinkUrl", e.target.value)
                    }
                  />
                  <span className="field-hint">
                    App deep link (e.g., yourapp://home)
                  </span>
                </div>
              </div>
            </section>

            {/* Display Settings */}
            <section className="config-section">
              <h2>🎨 Display Settings</h2>
              <div className="config-grid">
                <div className="config-field">
                  <label>Show QR Code</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="showQRCode"
                      checked={config.showQRCode}
                      onChange={(e) =>
                        handleConfigChange("showQRCode", e.target.checked)
                      }
                    />
                    <label htmlFor="showQRCode" className="toggle-label">
                      <span className="toggle-inner" />
                      <span className="toggle-switch-button" />
                    </label>
                  </div>
                  <span className="field-hint">Display QR code on launch page</span>
                </div>

                <div className="config-field">
                  <label>Theme Color</label>
                  <select
                    value={config.theme}
                    onChange={(e) => handleConfigChange("theme", e.target.value)}
                  >
                    <option value="purple">Purple</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="orange">Orange</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="config-actions">
              <button className="btn-primary" onClick={handleSave}>
                {saved ? "✓ Saved!" : "Save Configuration"}
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

            {/* Last Updated */}
            <p className="last-updated">
              Last updated:{" "}
              {new Date(config.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="config-content">
            {/* Stats Overview */}
            <section className="config-section">
              <h2>📊 Launch Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🚀</div>
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total Launches</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👆</div>
                  <div className="stat-value">{stats.manual}</div>
                  <div className="stat-label">Manual Clicks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{stats.auto}</div>
                  <div className="stat-label">Auto Launches</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔗</div>
                  <div className="stat-value">{stats.directLink}</div>
                  <div className="stat-label">Direct Links</div>
                </div>
              </div>

              {stats.averageCountdown > 0 && (
                <div className="stat-highlight">
                  <strong>Average countdown when users click manually:</strong>{" "}
                  {stats.averageCountdown} seconds remaining
                  <br />
                  <span className="hint">
                    {stats.averageCountdown > 3
                      ? "Users are eager! Consider shorter countdown."
                      : "Users are patient with current countdown."}
                  </span>
                </div>
              )}
            </section>

            {/* Daily Breakdown */}
            {Object.keys(stats.byDate).length > 0 && (
              <section className="config-section">
                <h2>📅 Daily Breakdown</h2>
                <div className="date-stats">
                  {Object.entries(stats.byDate).map(([date, count]) => (
                    <div key={date} className="date-row">
                      <span className="date">{date}</span>
                      <span className="count">{count} launches</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Activity */}
            <section className="config-section">
              <h2>🕐 Recent Activity (Last 10)</h2>
              {recentLaunches.length > 0 ? (
                <div className="activity-list">
                  {recentLaunches.map((launch, idx) => (
                    <div key={idx} className="activity-item">
                      <span className="activity-source">
                        {launch.source === "manual" && "👆 Manual Click"}
                        {launch.source === "auto" && "⏱️ Auto Launch"}
                        {launch.source === "direct-link" && "🔗 Direct Link"}
                      </span>
                      <span className="activity-time">
                        {new Date(launch.timestamp).toLocaleString()}
                      </span>
                      {launch.countdown && (
                        <span className="activity-countdown">
                          {launch.countdown}s remaining
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No activity yet</p>
              )}
            </section>

            {/* Analytics Actions */}
            <div className="config-actions">
              <button className="btn-primary" onClick={downloadAnalytics}>
                📥 Download CSV Report
              </button>
              <button className="btn-danger" onClick={handleClearData}>
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
