import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import CodeEvaluator from "./evaluator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const evaluator = new CodeEvaluator();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000000);
    const extension = path.extname(file.originalname);
    cb(null, `code-${timestamp}-${randomNum}${extension}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept common code file extensions
    const allowedExts = [
      ".js",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".ts",
      ".jsx",
      ".tsx",
      ".php",
      ".rb",
      ".go",
      ".rs",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only code files are allowed"), false);
    }
  },
});

// Routes

// Home page
app.get("/", (req, res) => {
  res.json({
    message: "Simple Code Evaluator API",
    version: "1.0.0",
    endpoints: {
      "POST /evaluate": "Evaluate code directly (JSON: {code, language})",
      "POST /upload": "Upload file and get evaluation",
      "GET /reports": "List all evaluation reports",
    },
  });
});

// Evaluate code directly
app.post("/evaluate", async (req, res) => {
  try {
    const { code, language = "unknown" } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Code is required",
      });
    }

    const result = await evaluator.evaluateCode(code, language);

    if (result.success) {
      // Save report
      const reportId = `report-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      const reportPath = path.join("reports", `${reportId}.json`);

      const reportData = {
        id: reportId,
        type: "direct",
        language: language,
        evaluation: result.evaluation,
        metadata: result.metadata,
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

      res.json({
        success: true,
        message: "Code evaluated successfully",
        reportId: reportId,
        evaluation: result.evaluation,
        metadata: result.metadata,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Evaluation failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in /evaluate:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Upload file and evaluate
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Read file content
    const filePath = req.file.path;
    const codeContent = fs.readFileSync(filePath, "utf8");

    // Detect language from file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    const languageMap = {
      ".js": "javascript",
      ".ts": "typescript",
      ".jsx": "javascript",
      ".tsx": "typescript",
      ".py": "python",
      ".java": "java",
      ".cpp": "cpp",
      ".c": "c",
      ".php": "php",
      ".rb": "ruby",
      ".go": "go",
      ".rs": "rust",
    };
    const language = languageMap[ext] || "unknown";

    // Evaluate code
    const result = await evaluator.evaluateCode(codeContent, language);

    if (result.success) {
      // Save report
      const reportId = `report-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;
      const reportPath = path.join("reports", `${reportId}.json`);

      const reportData = {
        id: reportId,
        type: "file",
        filename: req.file.originalname,
        uploadedFilename: req.file.filename,
        language: language,
        evaluation: result.evaluation,
        metadata: {
          ...result.metadata,
          fileSize: req.file.size,
          uploadPath: req.file.path,
        },
        createdAt: new Date().toISOString(),
      };

      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));

      res.json({
        success: true,
        message: "File uploaded and evaluated successfully",
        file: {
          original: req.file.originalname,
          uploaded: req.file.filename,
          size: req.file.size,
        },
        reportId: reportId,
        evaluation: result.evaluation,
        metadata: reportData.metadata,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Evaluation failed",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in /upload:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get all reports
app.get("/reports", (req, res) => {
  try {
    const reportsDir = "reports";
    const files = fs.readdirSync(reportsDir);
    const reports = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const content = fs.readFileSync(path.join(reportsDir, file), "utf8");
        const data = JSON.parse(content);
        return {
          id: data.id,
          type: data.type,
          filename: data.filename || "Direct input",
          language: data.language,
          createdAt: data.createdAt,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: reports.length,
      reports: reports,
    });
  } catch (error) {
    console.error("Error in /reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reports",
      error: error.message,
    });
  }
});

// Get specific report
app.get("/report/:id", (req, res) => {
  try {
    const reportId = req.params.id;
    const reportPath = path.join("reports", `${reportId}.json`);

    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const reportData = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    res.json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    console.error("Error in /report/:id:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get report",
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: "File upload error",
      error: error.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple Code Evaluator running on http://localhost:${PORT}`);
  console.log(`📝 Upload files at: POST http://localhost:${PORT}/upload`);
  console.log(`⚡ Evaluate code at: POST http://localhost:${PORT}/evaluate`);
  console.log(`📊 View reports at: GET http://localhost:${PORT}/reports`);
});
