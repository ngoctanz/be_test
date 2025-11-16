import { jwtConfig } from "../config/jwt.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";

const login = async (reqBody, res) => {
  const { username, password } = reqBody;
  const user = await User.findUserByUsername(username);
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const payload = {
    userId: user._id,
    userName: user.username,
    role: user.role,
  };
  const access_token = jwtConfig.generateAccessToken(payload);
  const refresh_token = jwtConfig.generateRefreshToken(payload);

  await User.updateUser(user._id, { refresh_token });

  // Gán tokens vào cookies
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  res.cookie("access_token", access_token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refresh_token", refresh_token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    user,
    access_token,
    refresh_token,
  };
};

const logout = async (userId) => {
  await User.updateUser(userId, { refresh_token: null });
  return { message: "Logged out successfully" };
};

const refreshToken = async (refreshToken, res) => {
  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select("+refresh_token");
    if (!user || user.refresh_token !== refreshToken)
      throw new ApiError(401, "Invalid refresh token");

    const payload = {
      userId: user._id,
      userName: user.username,
      email: user.email,
      role: user.role,
    };
    const newAccess_token = jwtConfig.generateAccessToken(payload);
    const newRefresh_token = jwtConfig.generateRefreshToken(payload);

    await User.updateUser(user._id, {
      refresh_token: newRefresh_token,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    };

    res.cookie("access_token", newAccess_token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", newRefresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      access_token: newAccess_token,
      refresh_token: newRefresh_token,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

const getCurrentUser = async (userId) => {
  try {
    const user = await User.findUserById(userId);
    if (!user) throw new ApiError(404, "User not found");
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, error.message || "Failed to get current user");
  }
};

export const authService = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
};
