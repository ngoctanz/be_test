import { TypeOrder } from "../models/typeOrderModel.js";

class TypeOrderService {
  async createTypeOrder(data) {
    return await TypeOrder.createTypeOrder(data);
  }

  async getAllTypeOrders() {
    return await TypeOrder.findAllTypeOrders();
  }

  async getTypeOrderById(id) {
    return await TypeOrder.findTypeOrderById(id);
  }

  async getTypeOrderByName(name) {
    return await TypeOrder.findTypeOrderByName(name);
  }

  async updateTypeOrder(id, data) {
    return await TypeOrder.updateTypeOrder(id, data);
  }

  async hideTypeOrder(id) {
    return await TypeOrder.hideTypeOrder(id);
  }

  async deleteTypeOrder(id) {
    return await TypeOrder.deleteTypeOrder(id);
  }
}

export const typeOrderService = new TypeOrderService();
