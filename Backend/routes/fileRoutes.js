import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import { uploadFile, getFileById, getAllFiles, deleteFile } from "../controllers/fileController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "Backend/uploads/" }); // Simple temp dest

router.post("/uploads", adminAuth, upload.single("uploadedFile"), uploadFile);
router.get("/files/:id", getFileById);
router.get("/all-files", adminAuth, getAllFiles);
router.delete("/files/:id", adminAuth, deleteFile);

export default router;
