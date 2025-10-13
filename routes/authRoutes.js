import { Router } from "express";

import {
  loginController,
  logoutController,
} from "../controllers/authControllers.js";

const authRouter = Router();

authRouter.post("/login", loginController);

authRouter.post("/logout", logoutController);

export default authRouter;
