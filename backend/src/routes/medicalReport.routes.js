const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/auth.middleware");
const {
  uploadAndParseReport,
  getUserReports,
  getHealthProfile,
} = require("../controllers/medicalReport.controllers");

const router = express.Router();

// Ensure temporary uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF (.pdf) and Word (.docx/.doc) documents are allowed.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB file limit
  fileFilter,
});

// Protect all medical report routes
router.use(authMiddleware);

router.post("/upload", upload.single("file"), uploadAndParseReport);
router.get("/", getUserReports);
router.get("/profile", getHealthProfile);

module.exports = router;
