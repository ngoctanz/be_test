import Joi from "joi";
import ApiError from "../utils/apiError.js";

const loginCondition = Joi.object({
  username: Joi.string().required().trim(),
  password: Joi.string().required().trim(),
});

const login = async (req, res, next) => {
  try {
    await loginCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage =
      error.details?.map((detail) => detail.message).join(", ") ||
      error.message;
    return next(new ApiError(400, errorMessage));
  }
};

export const authValidation = {
  login,
};
