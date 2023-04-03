const express = require("express");
const multer = require("multer");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

// Initialize express app
const app = express();

// Cors Mounting
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, CB) => {
    CB(null, __dirname + "/uploads");
  },
  filename: (req, file, CB) => {
    CB(null, file.originalname);
  },
});

const uploads = multer({ storage: storage });

app.post("/uploads", uploads.none(), (req, res, next) => {
  console.log(req.body);
  res.json({ status: "files upload successful" });
});

// Start server
const PORT = process.env.PORT || 5000;
const STATUS = process.env.NODE_ENV;
app.listen(PORT, () => {
  console.log(`Server is running in ${STATUS} mode on port ${PORT}`.bgWhite.green);
});
