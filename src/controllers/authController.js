import { authService } from "../services/authService.js";
import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/apiError.js";

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body, res);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "login successful!",
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token || req.body?.refresh_token;

    if (!token) {
      return next(new ApiError(401, "Refresh token not found"));
    }

    const result = await authService.refreshToken(token, res);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await authService.logout(userId);

    // Xóa cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getCurrentUser(userId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get current user successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
};
