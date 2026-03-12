import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    userTitle: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("File", fileSchema);
