import { Food } from "../models/foodModel.js";

class FoodService {
  async getAllFoods() {
    return await Food.findAllFoods();
  }

  async getAllFoodsPaginated(skip, limit) {
    return await Food.findAllFoodsPaginated(skip, limit);
  }

  async searchFoods(searchTerm, skip, limit) {
    return await Food.searchFoods(searchTerm, skip, limit);
  }

  async getFoodById(id) {
    return await Food.findFoodById(id);
  }

  async createFood(data) {
    return await Food.createFood(data);
  }

  async updateFood(id, data) {
    return await Food.updateFood(id, data);
  }

  async hideFood(id) {
    return await Food.hideFood(id);
  }

  async deleteFood(id) {
    return await Food.deleteFood(id);
  }
}

export const foodService = new FoodService();
