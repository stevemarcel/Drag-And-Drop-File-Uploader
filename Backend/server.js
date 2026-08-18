import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import colors from "colors";
import dotenv from "dotenv";
import session from "express-session";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "./config/db.js";

import { adminAuth } from "./middlewares/adminAuth.js";
import adminRoutes from "./routes/adminRoutes.js";
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

// --- ADMIN SESSION ---
// Creates a secure server-side session for authenticated administrators
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

// --- 1. THE PROTECTED ADMIN ROUTE ---
// When you go to "/", Authentication is handled through the server-side session
app.get("/", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

// --- 2. THE PUBLIC DOWNLOAD ROUTE ---
// Serve download page without auth
app.get("/download", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/download.html"));
});

// --- 3. STATIC ASSETS ---
// Serve CSS, JS, and Images
app.use("/css", express.static(path.join(__dirname, "../Frontend/css")));
app.use("/js", express.static(path.join(__dirname, "../Frontend/js")));
app.use("/img", express.static(path.join(__dirname, "../Frontend/img")));

// --- 4. ADMIN AUTHENTICATION ROUTES ---
app.use("/api/admin", adminRoutes);

// --- 5. FILE API ROUTES ---
app.use("/api", fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`\n🚀 Server started on port ${PORT}`.yellow.bold));
console.log(`Mode: ${process.env.NODE_ENV || "development"}\n`.gray);
