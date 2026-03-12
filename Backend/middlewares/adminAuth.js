export const adminAuth = (req, res, next) => {
  // You can also move this string to your .env file for extra security
  const ADMIN_SECRET = process.env.ADMIN_ACCESS_KEY;

  // Check if the 'auth' query parameter matches our secret
  if (req.query.auth === ADMIN_SECRET) {
    next(); // Access granted
  } else {
    res.status(403).json({ error: "Unauthorized access" });
  }
};
