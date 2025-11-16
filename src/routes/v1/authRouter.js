import express from "express";
import { authValidation } from "../../validations/authValidation.js";
import { authController } from "../../controllers/authController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  authLimiter,
  loginLimiter,
  refreshLimiter,
} from "../../middlewares/rateLimitMiddleware.js";

const Router = express.Router();

Router.use(authLimiter);

Router.post("/login", authValidation.login, authController.login);
Router.get("/me", authMiddleware, authController.getCurrentUser);
Router.post("/logout", authMiddleware, authController.logout);
Router.post("/refresh_token", refreshLimiter, authController.refreshToken);

export const authRouter = Router;
