import { Router } from "express";
import { verifyAdmin } from "../middlewares/checkAuth.js";

const adminRouter = Router();

adminRouter.get("/data", verifyAdmin, (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "Admin authenticated" });
});

export default adminRouter;
