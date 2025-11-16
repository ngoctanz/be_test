import { StatusCodes } from "http-status-codes";
import { unitService } from "../services/unitService.js";

const create = async (req, res, next) => {
  try {
    const unit = await unitService.createUnit(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Unit created successfully!",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const units = await unitService.getAllUnits();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get units successfully",
      result: units.length,
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const unit = await unitService.getUnitById(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get unit details successfully",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const unit = await unitService.updateUnit(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unit updated successfully",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const hide = async (req, res, next) => {
  try {
    const unit = await unitService.hideUnit(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unit hidden successfully",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    await unitService.deleteUnit(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Unit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const unitController = {
  create,
  getAll,
  getById,
  update,
  hide,
  delete: delete_,
};
