import express from "express";
import { foodController } from "../../controllers/foodController.js";
import { foodValidation } from "../../validations/foodValidation.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const Router = express.Router();

// All routes require authentication
Router.use(authMiddleware);

Router.route("/")
  .get(foodController.getAllFoods)
  .post(foodValidation.createFood, foodController.createFood);

Router.route("/:id")
  .get(foodController.getFoodById)
  .put(foodValidation.updateFood, foodController.updateFood)
  .delete(foodController.deleteFood);

Router.patch("/:id/hide", foodController.hideFood);

export const foodRouter = Router;
