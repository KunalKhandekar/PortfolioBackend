import jwt from "jsonwebtoken";

export const loginController = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(404).json({
      success: false,
      message: "Email and password both fields are required",
    });
  }

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const sessionID = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const sessionExpiry = 7 * 24 * 60 * 60 * 1000;
    res.cookie("admin_token", sessionID, {
      httpOnly: true,
      signed: true,
      maxAge: sessionExpiry,
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged in successfully" });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials !" });
};

export const logoutController = (req, res) => {
  const token = req.signedCookies.admin_token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  res.clearCookie("admin_token");
  return res.json({ success: true, message: "Logged out" });
};
