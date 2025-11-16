import { StatusCodes } from "http-status-codes";
import { orderService } from "../services/orderService.js";
import {
  parsePaginationParams,
  validatePaginationParams,
  buildPaginationMetadata,
  parseOrderFilters,
} from "../utils/paginationUtils.js";

const getAll = async (req, res, next) => {
  try {
    // Parse and validate pagination params
    const { page, limit, skip } = parsePaginationParams(req.query);
    const validation = validatePaginationParams(page, limit);

    if (!validation.isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: validation.error,
        data: null,
      });
    }

    // Fetch data without filters
    const result = await orderService.getAllOrdersPaginated(skip, limit);

    // Build response
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: buildPaginationMetadata(page, limit, result.total),
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const validation = validatePaginationParams(page, limit);

    if (!validation.isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: validation.error,
        data: null,
      });
    }

    const filters = parseOrderFilters(req.query);

    const result = await orderService.getAllOrdersWithFilters(
      skip,
      limit,
      filters
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: buildPaginationMetadata(page, limit, result.total),
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { page, limit, skip } = parsePaginationParams(req.query);
    const validation = validatePaginationParams(page, limit);

    if (!validation.isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: validation.error,
        data: null,
      });
    }

    const result = await orderService.getOrdersByUserPaginated(
      userId,
      skip,
      limit
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.orders,
      pagination: buildPaginationMetadata(page, limit, result.total),
    });
  } catch (error) {
    next(error);
  }
};

const getByPartner = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const orders = await orderService.getOrdersByPartner(partnerId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const files = req.files || [];
    const order = await orderService.createOrderWithMedia(req.body, files);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    let updatedOrder;
    if (files.length > 0 || req.body.imagevideo_list) {
      updatedOrder = await orderService.updateOrderWithMedia(
        id,
        req.body,
        files
      );
    } else {
      updatedOrder = await orderService.updateOrder(id, req.body);
    }

    if (!updatedOrder) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.deleteOrder(id);
    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const hide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.hideOrder(id);
    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Order hidden successfully",
      data: result,
    });
  } catch (error) {
    next(error.message || error);
  }
};

export const orderController = {
  getAll,
  search,
  getById,
  getByUserId,
  getByPartner,
  create,
  update,
  remove,
  hide,
};
