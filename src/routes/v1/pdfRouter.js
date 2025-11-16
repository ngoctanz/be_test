import express from "express";
import { pdfController } from "../../controllers/pdfController.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// POST routes - generate PDF from data
router.post("/generate", authMiddleware, pdfController.generatePDFFromData);
router.post("/preview", authMiddleware, pdfController.previewPDFFromData);

// GET routes - legacy support (generate from Order ID)
router.get("/invoice/:orderId", authMiddleware, pdfController.generateInvoicePDF);
router.get("/preview/:orderId", authMiddleware, pdfController.previewInvoicePDF);

export default router;
