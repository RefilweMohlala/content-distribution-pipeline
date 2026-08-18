const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const PAYLOAD_DIR = path.join(__dirname, "received_payloads");
if (!fs.existsSync(PAYLOAD_DIR)) fs.mkdirSync(PAYLOAD_DIR, { recursive: true });

function logPayload(platform, body) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${platform}_${timestamp}.json`;
  fs.writeFileSync(
    path.join(PAYLOAD_DIR, filename),
    JSON.stringify({ platform, receivedAt: new Date().toISOString(), body }, null, 2)
  );
  return filename;
}

function makePlatformHandler(platform) {
  return (req, res) => {
    const filename = logPayload(platform, req.body);
    console.log(`[${platform.toUpperCase()}] Received post payload -> saved as ${filename}`);
    res.status(200).json({
      success: true,
      platform,
      post_id: `dist_${platform}_${Date.now()}`,
      status: "queued",
      scheduled_for: req.body.scheduled_for || new Date().toISOString(),
      received_filename: filename
    });
  };
}

app.get("/health", (req, res) => res.status(200).json({ status: "ok", service: "distribution-layer" }));

app.post("/linkedin", makePlatformHandler("linkedin"));
app.post("/twitter", makePlatformHandler("twitter"));
app.post("/instagram", makePlatformHandler("instagram"));
app.post("/youtube", makePlatformHandler("youtube"));

app.get("/api/scheduled-posts", (req, res) => {
  const files = fs.readdirSync(PAYLOAD_DIR).filter(f => f.endsWith(".json"));
  const posts = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(PAYLOAD_DIR, f), "utf-8"));
    return { platform: data.platform, receivedAt: data.receivedAt, body: data.body };
  });
  posts.sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  res.json({ count: posts.length, posts });
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Distribution layer + dashboard listening on port ${PORT}`));