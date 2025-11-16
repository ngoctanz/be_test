import Joi from "joi";
import ApiError from "../utils/apiError.js";

const createUnitCondition = Joi.object({
  name: Joi.string().required().min(1).trim().strict(),
});

const createUnit = async (req, res, next) => {
  try {
    await createUnitCondition.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (error) {
    const errorMessage =
      error.details?.map((detail) => detail.message).join(", ") ||
      error.message;
    return next(new ApiError(400, errorMessage));
  }
};

const validateUpdateData = (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Object.keys(data).length === 0)
      return next(new ApiError(400, "Data is required!"));

    const allowedFields = ["name"];
    const hasValidField = allowedFields.some(
      (field) => data[field] !== undefined
    );
    if (!hasValidField)
      return next(new ApiError(400, "No valid fields to update!"));
    next();
  } catch (error) {
    return next(error);
  }
};

export const unitValidation = {
  createUnit,
  validateUpdateData,
};
