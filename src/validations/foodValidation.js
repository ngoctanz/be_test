import Joi from "joi";
import ApiError from "../utils/apiError.js";

const createFoodCondition = Joi.object({
  name: Joi.string().required().min(1).trim().strict(),
  price: Joi.number().min(0).required(),
});

const updateFoodCondition = Joi.object({
  name: Joi.string().min(1).trim().strict(),
  price: Joi.number().min(0),
}).min(1);

const createFood = async (req, res, next) => {
  try {
    await createFoodCondition.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (error) {
    const errorMessage =
      error.details?.map((detail) => detail.message).join(", ") ||
      error.message;
    return next(new ApiError(400, errorMessage));
  }
};

const updateFood = async (req, res, next) => {
  try {
    await updateFoodCondition.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (error) {
    const errorMessage =
      error.details?.map((detail) => detail.message).join(", ") ||
      error.message;
    return next(new ApiError(400, errorMessage));
  }
};

export const foodValidation = {
  createFood,
  updateFood,
};
