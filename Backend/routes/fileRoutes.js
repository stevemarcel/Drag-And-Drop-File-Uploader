import express from "express";
import multer from "multer";
import { adminAuth } from "../middlewares/adminAuth.js";
import { uploadFile, getFileById, getAllFiles, deleteFile } from "../controllers/fileController.js";

const router = express.Router();
const upload = multer({ dest: "Backend/uploads/" });

router.post("/uploads", adminAuth, upload.single("file"), uploadFile);
router.get("/files/:id", getFileById);
router.get("/all-files", adminAuth, getAllFiles);
router.delete("/files/:id", adminAuth, deleteFile);

export default router;
