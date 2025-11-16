import Joi from "joi";
import ApiError from "../utils/apiError.js";

const createOrderCondition = Joi.object({
  idOrder: Joi.string().required().trim().strict(),
  order_date: Joi.string().required().isoDate(),
  id_type_order: Joi.string().hex().length(24).allow(null).optional(),
  idPartner: Joi.string().hex().length(24).allow(null).optional(),
  customer_name: Joi.string().required().min(1).trim().strict(),
  address: Joi.string().required().min(1).trim().strict(),
  floor: Joi.string().trim().allow(null).optional(),
  basement: Joi.string().trim().allow(null).optional(),
  customer_quantity: Joi.number().integer().min(1).required(),
  note: Joi.string().trim().allow(null).optional(),
  food_list: Joi.array()
    .items(
      Joi.object({
        food: Joi.string().required().trim(),
        quantity: Joi.string().required().trim(),
      })
    )
    .min(1)
    .required(),
  serving_time: Joi.string().trim().allow(null).optional(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().hex().length(24).allow(null).optional(),
  discount: Joi.number().min(0).max(100).default(0),
  vat: Joi.number().min(0).max(100).default(0),
  transport_charge: Joi.number().min(0).default(0),
  equipment_charge: Joi.number().min(0).default(0),
  table_charge: Joi.number().min(0).default(0),
  service_charge: Joi.number().min(0).default(0),
  other_charge: Joi.number().min(0).default(0),
  arrival_time: Joi.string().allow(null).optional(),
  transfer_time: Joi.string().allow(null).optional(),
  imagevideo_list: Joi.array().items(Joi.string().allow("")).default([]),
  idUser: Joi.string().hex().length(24).required(),
});

const createOrder = async (req, res, next) => {
  try {
    // Process food_list before validation
    let foodList = req.body.food_list;
    if (typeof foodList === "string") {
      try {
        foodList = JSON.parse(foodList);
      } catch (e) {
        foodList = [];
      }
    }
    if (!Array.isArray(foodList)) {
      foodList = [];
    }
    // Ensure each item has food and quantity
    foodList = foodList
      .map((item) => {
        if (typeof item === "object" && item.food && item.quantity) {
          return {
            food: String(item.food).trim(),
            quantity: String(item.quantity).trim(),
          };
        }
        return null;
      })
      .filter((item) => item !== null);
    req.body.food_list = foodList;

    // Process imagevideo_list before validation
    let imageVideoList = req.body.imagevideo_list;
    if (typeof imageVideoList === "string") {
      try {
        imageVideoList = JSON.parse(imageVideoList);
      } catch (e) {
        imageVideoList = [imageVideoList];
      }
    }
    if (!Array.isArray(imageVideoList)) {
      imageVideoList = [];
    }
    req.body.imagevideo_list = imageVideoList;

    await createOrderCondition.validateAsync(req.body, { abortEarly: true });
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

    const allowedFields = [
      "order_date",
      "id_type_order",
      "idPartner",
      "customer_name",
      "address",
      "floor",
      "basement",
      "customer_quantity",
      "note",
      "food_list",
      "serving_time",
      "price",
      "unit",
      "discount",
      "vat",
      "transport_charge",
      "equipment_charge",
      "table_charge",
      "service_charge",
      "other_charge",
      "arrival_time",
      "transfer_time",
      "imagevideo_list",
    ];

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

export const orderValidation = {
  createOrder,
  validateUpdateData,
};
