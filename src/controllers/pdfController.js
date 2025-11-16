import { StatusCodes } from "http-status-codes";
import { pdfService } from "../services/pdfService.js";
import { validateBillData } from "../utils/pdfUtils.js";

class PDFController {
  async generatePDFFromData(req, res, next) {
    try {
      const billData = req.body;
      const validation = validateBillData(billData);

      if (!validation.isValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: validation.error,
        });
      }

      const pdfBuffer = await pdfService.generatePDFFromData(billData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${billData.orderId}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async previewPDFFromData(req, res, next) {
    try {
      const billData = req.body;
      const validation = validateBillData(billData);

      if (!validation.isValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: validation.error,
        });
      }

      const pdfBuffer = await pdfService.generatePDFFromData(billData);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=invoice-${billData.orderId}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async generateInvoicePDF(req, res, next) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const pdfBuffer = await pdfService.generateOrderPDF(orderId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice-${orderId}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  async previewInvoicePDF(req, res, next) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Order ID is required",
        });
      }

      const pdfBuffer = await pdfService.generateOrderPDF(orderId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=invoice-${orderId}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const pdfController = new PDFController();
