import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import "./AppLaunch.css";
import { getConfig, updateConfig } from "./config";
import { getAppLaunches } from "./analytics";
import { useTilt } from "./useTilt";
import appIcon from "./assets/outletAi.png";
import litIcon from "./assets/lit-icon.png";

function recordLaunch() {
  const launches = getAppLaunches();
  launches.push({ source: "go-live", timestamp: new Date().toISOString() });
  localStorage.setItem("appLaunches", JSON.stringify(launches));
}

function Ripple() {
  return (
    <motion.span
      className="success-ripple"
      initial={{ scale: 0.6, opacity: 0.6 }}
      animate={{ scale: 1.8, opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    />
  );
}

// The two cosmetic steps are timed to fill the cancellable window; the final
// step performs the real write and only resolves once it's done.
const LAUNCH_STEPS = ["Verifying release", "Notifying go-live channel", "Confirming"];
const STEP_DELAY_MS = 2200;
const MIN_CONFIRM_MS = 500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  const [status, setStatus] = useState("idle"); // idle, launching, signaled, error
  const [errorMessage, setErrorMessage] = useState("");
  const [signaledAt, setSignaledAt] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(0);
  const cancelled = useRef(false);

  const { x: tiltX, y: tiltY } = useTilt();
  const glowX = useTransform(tiltX, [-1, 1], [-180, 180]);
  const glowY = useTransform(tiltY, [-1, 1], [-180, 180]);
  const starsX = useTransform(tiltX, [-1, 1], [60, -60]);
  const starsY = useTransform(tiltY, [-1, 1], [60, -60]);
  const heroRotateY = useTransform(tiltX, [-1, 1], [-10, 10]);
  const heroRotateX = useTransform(tiltY, [-1, 1], [10, -10]);

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
    cancelled.current = false;
    setCompletedSteps(0);
    setStatus("launching");
    runLaunchSequence();
  };

  // Cancel only works up through the cosmetic steps — once "Confirming" is
  // actually writing to Firestore, that step's own await is what finishes it.
  const handleCancelLaunch = () => {
    if (completedSteps >= LAUNCH_STEPS.length - 1) return;
    cancelled.current = true;
    setStatus("idle");
  };

  const runLaunchSequence = async () => {
    setErrorMessage("");

    // Two cosmetic steps for pacing.
    for (let i = 0; i < LAUNCH_STEPS.length - 1; i++) {
      await delay(STEP_DELAY_MS);
      if (cancelled.current) return;
      setCompletedSteps(i + 1);
    }

    // Final step performs the real write, with a small minimum duration so
    // it never feels like a flicker even on a fast connection.
    const sentAt = new Date().toISOString();
    const confirmStart = Date.now();
    let writeError = null;

    try {
      recordLaunch();
      await updateConfig({ lastSignaledAt: sentAt });
    } catch (err) {
      writeError = err;
    }

    const elapsed = Date.now() - confirmStart;
    if (elapsed < MIN_CONFIRM_MS) {
      await delay(MIN_CONFIRM_MS - elapsed);
    }
    if (cancelled.current) return;

    setCompletedSteps(LAUNCH_STEPS.length);

    if (writeError) {
      setErrorMessage(writeError.message || "Something went wrong while sending the signal.");
      setStatus("error");
      return;
    }

    setSignaledAt(sentAt);
    setStatus("signaled");
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
      <motion.div className="launch-glow" style={{ x: glowX, y: glowY }} />
      <motion.div className="launch-stars" style={{ x: starsX, y: starsY }} />

      <header className="launch-topbar">
        <div className="topbar-status">
          <span className={`topbar-dot ${status === "signaled" ? "live" : ""}`} />
          {status === "signaled" ? "Live" : "Standby"}
        </div>
        <Clock />
      </header>

      <main className="launch-hero" style={{ perspective: 1000 }}>
        <motion.div style={{ rotateX: heroRotateX, rotateY: heroRotateY }} className="hero-tilt">
          <motion.div
            className="hero-brand-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={litIcon} alt="Lohiya Intelligent Technologies" className="hero-lit-logo" />
            <span className="hero-brand-divider" />
            <img src={appIcon} alt="" className="hero-brand-logo" />
          </motion.div>
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
            {status === "idle" && (
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
                <p className="launch-hint">
                  Runs a short countdown before launching &mdash; you can still cancel.
                </p>
              </>
            )}

            {status === "launching" && (
              <div className="status-block sending-steps">
                {LAUNCH_STEPS.map((label, i) => {
                  const done = i < completedSteps;
                  const active = i === completedSteps;
                  return (
                    <motion.div
                      key={label}
                      className={`sending-step ${done ? "done" : active ? "active" : ""}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: done || active ? 1 : 0.35, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="step-indicator">
                        {done ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : active ? (
                          <span className="step-spinner" />
                        ) : (
                          <span className="step-dot" />
                        )}
                      </span>
                      <span className="step-label">{label}</span>
                    </motion.div>
                  );
                })}
                {completedSteps < LAUNCH_STEPS.length - 1 && (
                  <button className="retry-button launch-cancel" onClick={handleCancelLaunch}>
                    Cancel
                  </button>
                )}
              </div>
            )}

            {status === "signaled" && (
              <div className="status-block status-success">
                <div className="success-mark-wrapper">
                  <Ripple />
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
                <h2 className="shimmer-text">Launch confirmed</h2>
                <p className="status-text">
                  {config.appName} is being published to Google Play.
                </p>
                {signaledAt && (
                  <p className="status-text status-timestamp">
                    Confirmed at {new Date(signaledAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="status-block status-error">
                <h2>Something went wrong</h2>
                <p className="status-text">{errorMessage}</p>
                <button className="retry-button" onClick={handleRetry}>
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      <footer className="launch-footer">
        <img src={litIcon} alt="" className="footer-logo" />
        Lohiya Intelligent Technologies
      </footer>
    </div>
  );
}
