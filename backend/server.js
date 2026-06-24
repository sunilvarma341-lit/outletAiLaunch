require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
const GO_LIVE_TOKEN = process.env.GO_LIVE_TOKEN;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const LOG_FILE = path.join(__dirname, "launch-log.txt");

if (!GO_LIVE_TOKEN) {
  console.error("Missing GO_LIVE_TOKEN in backend/.env");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

function requireToken(req, res, next) {
  const token = req.get("x-go-live-token");
  if (token !== GO_LIVE_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/go-live", requireToken, (_req, res) => {
  const receivedAt = new Date().toISOString();
  const line = `[${receivedAt}] Director clicked GO LIVE — go turn off Managed Publishing now.\n`;

  console.log("\n" + "=".repeat(60));
  console.log("  GO LIVE SIGNAL RECEIVED");
  console.log("  " + line.trim());
  console.log("=".repeat(60) + "\n");

  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) console.error("Failed to write launch log:", err.message);
  });

  res.json({ received: true, receivedAt });
});

app.listen(PORT, () => {
  console.log(`Go-live backend listening on http://localhost:${PORT}`);
});
