import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import { jwtConfig } from "../config/jwt.js";

export const authMiddleware = (req, res, next) => {
  let token = req.cookies?.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next(new ApiError(401, "Unauthorized: No or invalid token"));
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    // JWT verification failed (expired, invalid, etc.)
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Unauthorized: Token expired"));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Unauthorized: Invalid token"));
    }
    return next(new ApiError(401, "Unauthorized: Token verification failed"));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: You do not have permission"));
    }
    next();
  };
};
