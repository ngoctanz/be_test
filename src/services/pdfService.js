import puppeteer from "puppeteer";
import { Order } from "../models/orderModel.js";
import { generateInvoiceHTML } from "../utils/pdfTemplateUtils.js";
import { validateBillData, transformOrderToBillData } from "../utils/pdfUtils.js";

class PDFService {
  async generatePDFFromData(billData) {
    const validation = validateBillData(billData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let browser = null;
    try {
      const html = generateInvoiceHTML(billData);

      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      if (browser) {
        await browser.close().catch(console.error);
      }
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  async generateOrderPDF(orderId) {
    const order = await Order.findOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const billData = transformOrderToBillData(order);
    return this.generatePDFFromData(billData);
  }
}

export const pdfService = new PDFService();
