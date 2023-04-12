const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

// Initialize express app
const app = express();

// Cors Mounting
app.use(cors());

// serving website on the express server
app.use("/", express.static(path.join(__dirname, "../Frontend")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname + "/uploads");
  },
  filename: (req, file, cb) => {
    // const fileExt = path.extname(file.originalname);
    cb(null, Date.now() + "~" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// POST Route
app.post("/uploads", upload.single("uploadedFile"), (req, res, next) => {
  console.log(req.file);
  if (req.file === null) {
    return res.status(400).json({ error: "No File Uploaded!" });
  }
  const file = req.file;
  // Changing generated filename to original filename
  const fileName = file.filename;
  let splitFileName = fileName.split("~");
  const serverFileName = splitFileName[1];

  // Getting file type information
  const fileType = file.mimetype;

  res.json({
    serverFileName: serverFileName,
    filePath: file.path,
    msg: `${fileType} file uploaded successful`,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const STATUS = process.env.NODE_ENV;
app.listen(PORT, () => {
  console.log(`Server is running in ${STATUS} mode on port ${PORT}`.bgWhite.green);
});
