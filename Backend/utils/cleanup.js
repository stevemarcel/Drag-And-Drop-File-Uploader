import cron from "node-cron";
import { v2 as cloudinary } from "cloudinary";
import File from "../models/File.js"; // Adjust path to your model

export const startCleanupTask = () => {
  // Runs every day at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running daily cleanup task...");

    try {
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      // 1. Find all expired files
      const expiredFiles = await File.find({
        createdAt: { $lt: eightDaysAgo },
      });

      if (expiredFiles.length === 0) {
        console.log("No expired files to clean up.");
        return;
      }

      for (const file of expiredFiles) {
        // 2. Delete from Cloudinary (using 'raw' for ZIPs/PDFs)
        await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: "raw" });

        // 3. Delete from MongoDB
        await File.findByIdAndDelete(file._id);

        console.log(`Successfully deleted expired file: ${file.userTitle}`);
      }

      console.log(`Cleanup complete. Deleted ${expiredFiles.length} files.`);
    } catch (error) {
      console.error("Cleanup Task Error:", error);
    }
  });
};
