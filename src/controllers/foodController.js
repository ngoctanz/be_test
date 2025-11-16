import { foodService } from "../services/foodService.js";
import ApiError from "../utils/apiError.js";

class FoodController {
  // GET /food - Get all foods (with optional pagination)
  async getAllFoods(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If pagination params provided
      if (page && limit) {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let result;
        if (search) {
          result = await foodService.searchFoods(search, skip, limitNum);
        } else {
          result = await foodService.getAllFoodsPaginated(skip, limitNum);
        }

        return res.status(200).json({
          success: true,
          message: "Foods retrieved successfully",
          data: result.foods,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.total,
            totalPages: Math.ceil(result.total / limitNum),
          },
        });
      }

      // No pagination - return all
      const foods = await foodService.getAllFoods();
      return res.status(200).json({
        success: true,
        message: "Foods retrieved successfully",
        data: foods,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /food/:id - Get food by ID
  async getFoodById(req, res, next) {
    try {
      const { id } = req.params;
      const food = await foodService.getFoodById(id);

      return res.status(200).json({
        success: true,
        message: "Food retrieved successfully",
        data: food,
      });
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }

  // POST /food - Create new food
  async createFood(req, res, next) {
    try {
      const foodData = {
        name: req.body.name,
        price: parseFloat(req.body.price),
      };

      const food = await foodService.createFood(foodData);

      return res.status(201).json({
        success: true,
        message: "Food created successfully",
        data: food,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /food/:id - Update food
  async updateFood(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.name !== undefined) {
        updateData.name = req.body.name;
      }
      if (req.body.price !== undefined) {
        updateData.price = parseFloat(req.body.price);
      }

      const food = await foodService.updateFood(id, updateData);

      return res.status(200).json({
        success: true,
        message: "Food updated successfully",
        data: food,
      });
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }

  // PATCH /food/:id/hide - Soft delete (hide) food
  async hideFood(req, res, next) {
    try {
      const { id } = req.params;
      const food = await foodService.hideFood(id);

      return res.status(200).json({
        success: true,
        message: "Food hidden successfully",
        data: food,
      });
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }

  // DELETE /food/:id - Delete food permanently
  async deleteFood(req, res, next) {
    try {
      const { id } = req.params;
      await foodService.deleteFood(id);

      return res.status(200).json({
        success: true,
        message: "Food deleted successfully",
      });
    } catch (error) {
      next(new ApiError(404, error.message));
    }
  }
}

export const foodController = new FoodController();
