import jwt from "jsonwebtoken";

export function verifyAdmin(req, res, next) {
  const token = req.signedCookies.admin_token;
  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}
