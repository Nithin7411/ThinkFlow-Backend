const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-cover", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  cloudinary.uploader
    .upload_stream({ folder: "story-covers" }, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Cloudinary upload failed" });
      }

      res.json({ url: result.secure_url });
    })
    .end(req.file.buffer);
});

module.exports = router;
