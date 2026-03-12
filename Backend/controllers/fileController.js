import File from "../models/File.js";
import { v2 as cloudinary } from "cloudinary";

// POST /api/uploads
// DESC: Handle file metadata saving after successful Cloudinary upload
// ADMIN ONLY
export const uploadFile = async (req, res) => {
  try {
    // 1. Receive metadata from the frontend (no file here anymore)
    const { userTitle, cloudinaryUrl, cloudinaryId } = req.body;

    if (!cloudinaryUrl || !cloudinaryId) {
      return res.status(400).json({ error: "Cloudinary data missing" });
    }

    // 2. Save the metadata and references to MongoDB
    const newFile = await File.create({
      userTitle: userTitle,
      cloudinaryUrl: cloudinaryUrl,
      cloudinaryId: cloudinaryId,
    });

    // 3. Success Response
    res.status(201).json({
      success: true,
      message: "Metadata saved successfully!",
      fileId: newFile._id,
      userTitle: newFile.userTitle,
      expiryDate: newFile.expiresAt,
    });
  } catch (error) {
    process.env.NODE_ENV === "development" && console.error("Database Error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// GET /api/files/:id
// DESC: Fetch file metadata by ID for download page
// PUBLIC ROUTE
export const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "Link expired or invalid" });
    res.json(file);
  } catch (error) {
    process.env.NODE_ENV === "development" && console.error("Database Fetch Error:", error);
    res.status(500).json({ error: "Invalid ID format" });
  }
};

// GET /api/files
// DESC: Fetch all files (for admin dashboard)
// ADMIN ONLY
export const getAllFiles = async (req, res) => {
  try {
    // Fetch files, sorted by newest first
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// DELETE /api/files/:id
// DESC: Delete a file (admin only)
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // 1. Delete from Cloudinary
    await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: "raw" });

    // 2. Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "File deleted from Cloud and Database" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Deletion failed" });
  }
};
