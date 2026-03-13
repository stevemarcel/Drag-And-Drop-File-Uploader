import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminAuth = (req, res, next) => {
  const ADMIN_SECRET = process.env.ADMIN_ACCESS_KEY;

  // Check if the 'auth' query parameter matches our secret
  if (req.query.auth === ADMIN_SECRET) {
    next(); // Access granted
  } else {
    res.status(403).sendFile(path.join(__dirname, "../Frontend/unauthorized.html")); // Access denied
  }
};
