import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const adminAuth = (req, res, next) => {
  const ADMIN_SECRET = process.env.ADMIN_ACCESS_KEY;
  // Check if the administrator has an active authenticated session
  if (req.session?.isAdmin === true) {
    return next(); // Access granted
  }

  // No valid session — serve the unauthorized page
  const unauthorizedPath = path.join(__dirname, "..", "..", "Frontend", "unauthorized.html");

  return res.status(403).sendFile(unauthorizedPath);
};
