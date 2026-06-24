import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import "./AppLaunch.css";
import "./analytics.js"; // Load analytics utilities
import { getConfig } from "./config";
import appIcon from "./assets/app-icon.png"; // Import the app icon

export default function AppLaunch() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [goPressed, setGoPressed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const loaded = await getConfig();
      setConfig(loaded);

      const now = new Date();
      const start = new Date(loaded.launchStartTime);
      const diff = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 1000));

      setTimeUntilStart(diff);
      setCountdown(loaded.countdownDuration);
      setIsReady(true);
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (!isReady || !config) return;

    let intervalId;

    if (timeUntilStart > 0) {
      intervalId = setInterval(() => {
        setTimeUntilStart((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeUntilStart === 0 && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isReady, config, timeUntilStart, countdown]);

  const handleGoPress = () => {
    if (!config) return;

    setClicked(true);
    setGoPressed(true);

    const launches = JSON.parse(localStorage.getItem("appLaunches") || "[]");
    launches.push({
      source: "go-pressed",
      timestamp: new Date().toISOString(),
      countdown,
    });
    localStorage.setItem("appLaunches", JSON.stringify(launches));
  };

  if (!isReady || !config) {
    return (
      <div className="launch-container">
        <div className="launch-card">
          <p className="launching-text">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const padded = (value) => String(value).padStart(2, "0");
    return `${padded(hrs)}:${padded(mins)}:${padded(secs)}`;
  };

  const startMessage = timeUntilStart > 0
    ? `Starts in ${formatDuration(timeUntilStart)}`
    : countdown > 0
      ? `Timer remaining: ${formatDuration(countdown)}`
      : "Time completed. Press Go to continue.";

  return (
    <div className="launch-container">
      {/* <button
        className="admin-access-btn"
        onClick={() => navigate("/config")}
        title="Configuration & Analytics"
      >
        ⚙️
      </button> */}

      <div className="launch-card">
        <div className="logo-container">
          <div className="logo-placeholder">
            <img src={appIcon} alt="App Icon" className="app-icon" />
          </div>
        </div>

        <h1 className="app-title">{config.appName}</h1>
        <p className="app-subtitle">{config.appSubtitle}</p>

        <div className="countdown-section">
          <p className="launching-text">
            {countdown > 0
              ? `Timer remaining: ${countdown}s`
              : !goPressed
                ? "Time completed. Press Go to continue."
                : ""}
          </p>
          {countdown > 0 && (
            <div className="countdown-circle">
              <svg className="countdown-ring" viewBox="0 0 120 120">
                <circle
                  className="countdown-ring-background"
                  cx="60"
                  cy="60"
                  r="54"
                />
                <circle
                  className="countdown-ring-progress"
                  cx="60"
                  cy="60"
                  r="54"
                  style={{
                    strokeDashoffset: `${(countdown / config.countdownDuration) * 339.292}`,
                  }}
                />
              </svg>
              <span className="countdown-number">{countdown}</span>
            </div>
          )}
        </div>
    
        {!goPressed && (
          <button
            className={`launch-button ${clicked ? "clicked" : ""}`}
            onClick={handleGoPress}
            disabled={timeUntilStart > 0 || countdown > 0 || clicked}
          >
            {timeUntilStart > 0
              ? `Starts in ${formatDuration(timeUntilStart)}`
              : countdown > 0
                ? `Go in ${formatDuration(countdown)}`
                : "Go"}
          </button>
        )}

        {goPressed && (
          <div className="qr-section">
            <p className="qr-text">Scan the code or open the app link below</p>
            <div className="qr-code-container">
              <QRCode
                value={config.playStoreUrl}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="store-text">Play Store link:</p>
            <a
              href={config.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="direct-link"
            >
              Open Play Store
            </a>
          </div>
        )}
      </div>

      {/* {process.env.NODE_ENV === "development" && (
        <div className="debug-info">
          <p>Debug: Check console and localStorage for tracking data</p>
        </div>
      )} */}
    </div>
  );
}
