const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");

const pool = require("./config/db");

const testRoutes = require("./routes/test.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const { generalLimiter } = require("./middleware/rateLimiter.middleware");

const storeRoutes = require("./routes/store.routes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/stores", storeRoutes);
app.use(generalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Kirana API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});




// Central error handler (must be last)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.code === "LIMIT_UNEXPECTED_FILE"
        ? `Unexpected file field "${err.field}". Use the field name "image"`
        : err.message;

    return res.status(400).json({ success: false, message });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, message: err.message });
  }

  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;