import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./AppLaunch.css";
import { getConfig, updateConfig } from "./config";
import { getAppLaunches } from "./analytics";
import appIcon from "./assets/outletAi.png";

function recordLaunch() {
  const launches = getAppLaunches();
  launches.push({ source: "go-live", timestamp: new Date().toISOString() });
  localStorage.setItem("appLaunches", JSON.stringify(launches));
}

const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  angle: (360 / 14) * i,
  delay: Math.random() * 0.15,
}));

function Confetti() {
  return (
    <div className="confetti-burst">
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          className="confetti-dot"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((c.angle * Math.PI) / 180) * 90,
            y: Math.sin((c.angle * Math.PI) / 180) * 90,
            opacity: 0,
            scale: 0.4,
          }}
          transition={{ duration: 0.7, delay: c.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="topbar-clock">
      {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

export default function AppLaunch() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, confirming, sending, signaled, error
  const [errorMessage, setErrorMessage] = useState("");
  const [signaledAt, setSignaledAt] = useState(null);

  useEffect(() => {
    getConfig().then((loaded) => {
      setConfig(loaded);
      if (loaded.lastSignaledAt) {
        setSignaledAt(loaded.lastSignaledAt);
        setStatus("signaled");
      }
    });
  }, []);

  const handleGoLiveClick = () => {
    if (status !== "idle") return;
    setStatus("confirming");
  };

  const handleCancel = () => setStatus("idle");

  const handleConfirm = async () => {
    setStatus("sending");
    setErrorMessage("");

    if (!config.backendUrl) {
      setErrorMessage("Backend URL is not configured. Set it in /config before launching.");
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(`${config.backendUrl}/api/go-live`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-go-live-token": config.goLiveToken || "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to publish release.");
      }
      const sentAt = data.receivedAt || new Date().toISOString();
      recordLaunch();
      await updateConfig({ lastSignaledAt: sentAt });
      setSignaledAt(sentAt);
      setStatus("signaled");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong while publishing.");
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setErrorMessage("");
    setStatus("idle");
  };

  if (!config) {
    return (
      <div className="launch-page">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="launch-page">
      <div className="launch-glow" />
      <div className="launch-stars" />

      <header className="launch-topbar">
        <div className="topbar-status">
          <span className={`topbar-dot ${status === "signaled" ? "live" : ""}`} />
          {status === "signaled" ? "Live" : "Standby"}
        </div>
        <Clock />
      </header>

      <main className="launch-hero">
        <motion.img
          src={appIcon}
          alt=""
          className="hero-brand-logo"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h1
          className="hero-brand-name"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          {config.appName}
        </motion.h1>
        <motion.p
          className="hero-brand-subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {config.appSubtitle}
        </motion.p>

        <motion.div
          className="hero-action"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          {(status === "idle" || status === "confirming") && (
            <>
              <p className="launch-lead">
                The production build is staged and ready on Google Play.
              </p>
              <motion.button
                className="go-live-button"
                onClick={handleGoLiveClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Go Live
              </motion.button>
            </>
          )}

          {status === "sending" && (
            <div className="status-block">
              <div className="spinner" />
              <p className="status-text">Publishing release to Google Play&hellip;</p>
            </div>
          )}

          {status === "signaled" && (
            <div className="status-block status-success">
              <div className="success-mark-wrapper">
                <Confetti />
                <motion.div
                  className="success-mark"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              </div>
              <h2>App is live</h2>
              <p className="status-text">
                Published {signaledAt ? new Date(signaledAt).toLocaleString() : ""}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="status-block status-error">
              <h2>Launch failed</h2>
              <p className="status-text">{errorMessage}</p>
              <button className="retry-button" onClick={handleRetry}>
                Try again
              </button>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="launch-footer">Lohiya Intelligent Technologies</footer>

      {status === "confirming" && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h2>Confirm production launch</h2>
            <p>
              This will publish <strong>{config.appName}</strong> to all users on the
              Google Play Store. This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="modal-confirm" onClick={handleConfirm}>
                Confirm &amp; Launch
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
