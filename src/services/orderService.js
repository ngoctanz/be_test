import { Order } from "../models/orderModel.js";
import { cloudinaryService } from "./cloudinaryService.js";
import {
  buildOrderDataObject,
  filterValidUrls,
  parseImageVideoList,
  extractPublicIdsFromUrls,
  processOrderMedia,
} from "../utils/orderUtils.js";
import {
  transformOrderToIdOnly,
  transformOrdersToIdOnly,
} from "../utils/transformOrderUtils.js";

class OrderService {
  async getAllOrders() {
    const orders = await Order.findAllOrders();
    return transformOrdersToIdOnly(orders);
  }

  async getAllOrdersPaginated(skip, limit) {
    const result = await Order.findAllOrdersPaginated(skip, limit);
    return {
      orders: transformOrdersToIdOnly(result.orders),
      total: result.total,
    };
  }

  async getAllOrdersWithFilters(skip, limit, filters) {
    const result = await Order.findAllOrdersWithFilters(skip, limit, filters);
    return {
      orders: transformOrdersToIdOnly(result.orders),
      total: result.total,
    };
  }

  async getOrderById(id) {
    const order = await Order.findOrderById(id);
    return transformOrderToIdOnly(order);
  }

  async getOrdersByUser(userId) {
    const orders = await Order.findOrdersByUser(userId);
    return transformOrdersToIdOnly(orders);
  }

  async getOrdersByUserPaginated(userId, skip, limit) {
    const result = await Order.findOrdersByUserPaginated(userId, skip, limit);
    return {
      orders: transformOrdersToIdOnly(result.orders),
      total: result.total,
    };
  }

  async uploadOrderMedia(files, existingUrls = []) {
    let imageVideoUrls = existingUrls || [];

    if (files && files.length > 0) {
      const uploaded = await cloudinaryService.uploadMultipleImages(
        files,
        "party-management/orders"
      );
      imageVideoUrls = [...imageVideoUrls, ...uploaded.map((u) => u.url)];
    }
    return filterValidUrls(imageVideoUrls);
  }

  async createOrderWithMedia(reqBody, files) {
    const imageVideoUrls = await this.uploadOrderMedia(
      files,
      reqBody.imagevideo_list
    );
    const orderData = buildOrderDataObject(reqBody, imageVideoUrls);
    return await Order.createOrder(orderData);
  }

  async updateOrder(id, data) {
    return await Order.updateOrder(id, data);
  }

  async hideOrder(id) {
    return await Order.hideOrder(id);
  }

  async updateOrderWithMedia(id, reqBody, files = []) {
    const currentOrder = await Order.findOrderById(id);
    if (!currentOrder) {
      throw new Error("Order not found");
    }

    const newImageUrls = parseImageVideoList(reqBody.imagevideo_list);
    const finalImageUrls = await processOrderMedia({
      files,
      currentImageUrls: currentOrder.imagevideo_list || [],
      newImageUrls,
      cloudinaryService,
    });

    const updatedData = buildOrderDataObject(
      { ...reqBody, imagevideo_list: finalImageUrls },
      finalImageUrls
    );

    const updated = await Order.updateOrder(id, updatedData);
    return transformOrderToIdOnly(updated);
  }

  async deleteOrder(id) {
    const order = await Order.findOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.imagevideo_list && order.imagevideo_list.length > 0) {
      try {
        const publicIds = extractPublicIdsFromUrls(
          order.imagevideo_list,
          cloudinaryService
        );
        if (publicIds.length > 0) {
          await cloudinaryService.deleteMultipleImages(publicIds);
        }
      } catch (error) {
        console.error("Error deleting images from Cloudinary:", error);
      }
    }
    return await Order.deleteOrder(id);
  }
}

export const orderService = new OrderService();
