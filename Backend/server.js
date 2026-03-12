import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import colors from "colors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./config/db.js";
import { adminAuth } from "./middlewares/adminAuth.js";
import fileRoutes from "./routes/fileRoutes.js";
import { startCleanupTask } from "./utils/cleanup.js";

dotenv.config();
connectDB();

startCleanupTask();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// --- 1. THE PROTECTED ADMIN ROUTE ---
// When you go to "/", the adminAuth middleware checks for ?auth=your_key
app.get("/", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// --- 2. THE PUBLIC DOWNLOAD ROUTE ---
// No middleware here
app.get("/download", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/download.html"));
});

// --- 3. STATIC ASSETS ---
// Serve CSS, JS, and Images so the pages actually look good
app.use("/css", express.static(path.join(__dirname, "../Frontend/css")));
app.use("/js", express.static(path.join(__dirname, "../Frontend/js")));
app.use("/img", express.static(path.join(__dirname, "../Frontend/img")));

// Use API Routes
app.use("/api", fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Server started on port ${PORT}`.yellow.bold));
console.log(`Mode: ${process.env.NODE_ENV || "development"}\n`.gray);
