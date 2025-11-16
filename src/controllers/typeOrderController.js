import { StatusCodes } from "http-status-codes";
import { typeOrderService } from "../services/typeOrderService.js";

const create = async (req, res, next) => {
  try {
    const typeOrder = await typeOrderService.createTypeOrder(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Type order created successfully!",
      data: typeOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const typeOrders = await typeOrderService.getAllTypeOrders();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get type orders successfully",
      result: typeOrders.length,
      data: typeOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const typeOrder = await typeOrderService.getTypeOrderById(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get type order details successfully",
      data: typeOrder,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const typeOrder = await typeOrderService.updateTypeOrder(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Type order updated successfully",
      data: typeOrder,
    });
  } catch (error) {
    next(error);
  }
};

const hide = async (req, res, next) => {
  try {
    const typeOrder = await typeOrderService.hideTypeOrder(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Type order hidden successfully",
      data: typeOrder,
    });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    await typeOrderService.deleteTypeOrder(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Type order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const typeOrderController = {
  create,
  getAll,
  getById,
  update,
  hide,
  delete: delete_,
};
