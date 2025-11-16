import { StatusCodes } from "http-status-codes";
import { partnerService } from "../services/partnerService.js";

const create = async (req, res, next) => {
  try {
    const partner = await partnerService.createPartner(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Partner created successfully!",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const partners = await partnerService.getAllPartners();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get partners successfully",
      result: partners.length,
      data: partners,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const partner = await partnerService.getPartnerById(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Get partner details successfully",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const partner = await partnerService.updatePartner(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Partner updated successfully",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

const hide = async (req, res, next) => {
  try {
    const partner = await partnerService.hidePartner(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Partner hidden successfully",
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

const delete_ = async (req, res, next) => {
  try {
    await partnerService.deletePartner(req.params.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const partnerController = {
  create,
  getAll,
  getById,
  update,
  hide,
  delete: delete_,
};
