const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure the downloads directory exists
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // Extract the shortcode from the Instagram URL
  const shortcodeMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/);
  if (!shortcodeMatch) {
    return res.status(400).json({ error: "Invalid Instagram URL" });
  }
  const shortcode = shortcodeMatch[1];

  // Use instaloader to download the post
  exec(
    `instaloader --no-videos --no-metadata-json --no-captions --dirname-pattern=${downloadsDir}/{shortcode} --filename-pattern=media -- -${shortcode}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Instaloader error:", stderr);
        return res.status(500).json({ error: "Failed to download media: " + stderr });
      }

      // Find the downloaded file
      const postDir = path.join(downloadsDir, shortcode);
      fs.readdir(postDir, (err, files) => {
        if (err || !files.length) {
          return res.status(500).json({ error: "Failed to find downloaded media" });
        }

        const mediaFile = files.find((file) => file.endsWith(".jpg") || file.endsWith(".mp4"));
        if (!mediaFile) {
          return res.status(500).json({ error: "No media file found" });
        }

        res.json({ filePath: `/downloads/${shortcode}/${mediaFile}` });
      });
    }
  );
});

// Serve downloaded files
app.use("/downloads", express.static(downloadsDir));

app.listen(3001, () => {
  console.log("Instagram backend server running on http://localhost:3001");
});