import { formatCurrency, formatDate } from "./pdfUtils.js";

const generateItemsRows = (items, printConfig) => {
  return items
    .map(
      (item) => `
        <tr>
          ${printConfig.showSTT ? `<td class="text-center">${item.no}</td>` : ""}
          ${printConfig.showMon ? `<td>${item.name}</td>` : ""}
          ${printConfig.showSL ? `<td class="text-center">${item.quantity}</td>` : ""}
          ${printConfig.showDVT ? `<td class="text-center">${item.dvt || "-"}</td>` : ""}
          ${printConfig.showDinhLuong ? `<td class="text-center">${item.dinhLuong || "-"}</td>` : ""}
          ${printConfig.showDonGia ? `<td class="text-right">${formatCurrency(item.price)}</td>` : ""}
          ${printConfig.showPhiKhac ? `<td class="text-right">${formatCurrency(item.phiKhac || 0)}</td>` : ""}
          ${printConfig.showThanhTien ? `<td class="text-right">${formatCurrency(item.total)}</td>` : ""}
        </tr>
      `
    )
    .join("");
};

const generateTotalsSection = (billData) => {
  const { subtotal, discount, afterDiscount, vat, charges, grandTotal } =
    billData;

  let html = `
    <tr>
      <td class="label">Tạm tính:</td>
      <td class="amount">${formatCurrency(subtotal)}</td>
    </tr>
  `;

  if (discount.percent > 0) {
    html += `
      <tr>
        <td class="label">Chiết khấu (${discount.percent}%):</td>
        <td class="amount discount">-${formatCurrency(discount.amount)}</td>
      </tr>
      <tr>
        <td class="label">Sau chiết khấu:</td>
        <td class="amount">${formatCurrency(afterDiscount)}</td>
      </tr>
    `;
  }

  if (vat.percent > 0) {
    html += `
      <tr>
        <td class="label">VAT (${vat.percent}%):</td>
        <td class="amount">${formatCurrency(vat.amount)}</td>
      </tr>
    `;
  }

  const chargeLabels = {
    transport: "Phí vận chuyển",
    equipment: "Phí thiết bị",
    table: "Phí bàn ghế",
    service: "Phí dịch vụ",
    other: "Phí khác",
  };

  Object.entries(chargeLabels).forEach(([key, label]) => {
    if (charges[key] > 0) {
      html += `
        <tr>
          <td class="label">${label}:</td>
          <td class="amount">${formatCurrency(charges[key])}</td>
        </tr>
      `;
    }
  });

  html += `
    <tr class="grand-total-row">
      <td class="label">TỔNG CỘNG:</td>
      <td class="amount">${formatCurrency(grandTotal)}</td>
    </tr>
  `;

  return html;
};

export const generateInvoiceHTML = (billData) => {
  const { orderId, customerName, address, createdAt, items, printConfig } = billData;
  
  // Default printConfig if not provided
  const config = printConfig || {
    showSTT: true,
    showMon: true,
    showSL: true,
    showDVT: false,
    showDinhLuong: false,
    showDonGia: true,
    showPhiKhac: false,
    showThanhTien: true,
  };

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hóa đơn #${orderId}</title>
  <style>
    @page {
      margin: 15mm;
      size: A4;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
    }
    
    .invoice-wrapper {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
    }
    
    /* Header */
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #2563eb;
    }
    
    .company-name {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
    
    .company-info {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }
    
    /* Invoice Title */
    .invoice-title {
      text-align: center;
      margin: 20px 0;
    }
    
    .invoice-title h1 {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    
    .invoice-meta {
      display: flex;
      justify-content: center;
      gap: 40px;
      font-size: 12px;
      color: #666;
    }
    
    .invoice-meta strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    /* Customer Info */
    .customer-info {
      background: #f8fafc;
      padding: 12px 18px;
      border-radius: 6px;
      margin-bottom: 20px;
      border-left: 4px solid #2563eb;
    }
    
    .customer-info div {
      margin: 4px 0;
      font-size: 13px;
    }
    
    .customer-info .label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      min-width: 100px;
    }
    
    .customer-info .value {
      color: #1e293b;
      font-weight: 500;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      border: 1px solid #cbd5e1;
    }
    
    .items-table thead {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: #fff;
    }
    
    .items-table th {
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #1e40af;
    }
    
    .items-table td {
      padding: 10px 8px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
      vertical-align: middle;
    }
    
    .items-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .items-table tbody tr:hover {
      background: #eff6ff;
    }
    
    .text-center {
      text-align: center !important;
    }
    
    .text-right {
      text-align: right !important;
    }
    
    /* Summary */
    .summary-section {
      margin-top: 25px;
      display: flex;
      justify-content: flex-end;
    }
    
    .summary-table {
      width: 450px;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
    }
    
    .summary-table td {
      padding: 8px 15px;
      font-size: 13px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .summary-table .label {
      text-align: right;
      color: #475569;
      font-weight: 500;
      width: 60%;
    }
    
    .summary-table .amount {
      text-align: right;
      color: #1e293b;
      font-weight: 600;
      width: 40%;
    }
    
    .summary-table .discount {
      color: #dc2626;
    }
    
    .summary-table .grand-total-row {
      border-top: 2px solid #2563eb;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    }
    
    .summary-table .grand-total-row td {
      padding: 12px 15px;
      border-bottom: none;
    }
    
    .summary-table .grand-total-row .label {
      font-size: 15px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .summary-table .grand-total-row .amount {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    
    .footer-note {
      margin: 6px 0;
    }
    
    .footer-contact {
      margin-top: 12px;
      font-weight: 600;
      color: #2563eb;
      font-size: 13px;
    }
    
    /* Print Styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      
      .invoice-wrapper {
        max-width: 100%;
        padding: 0;
      }
      
      .items-table tbody tr:hover {
        background: inherit;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="header">
      <div class="company-name">NHÀ HÀNG VIP PRO</div>
      <div class="company-info">
        Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
        Điện thoại: 0123 456 789 | Email: contact@vippro.vn
      </div>
    </div>

    <!-- Invoice Title -->
    <div class="invoice-title">
      <h1>HÓA ĐƠN ĐIỆN TỬ</h1>
      <div class="invoice-meta">
        <span><strong>Số:</strong> ${orderId}</span>
        <span><strong>Ngày:</strong> ${formatDate(createdAt)}</span>
      </div>
    </div>

    <!-- Customer Info -->
    <div class="customer-info">
      <div><span class="label">Khách hàng:</span> <span class="value">${customerName}</span></div>
      ${address ? `<div><span class="label">Địa chỉ:</span> <span class="value">${address}</span></div>` : ""}
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          ${config.showSTT ? '<th style="width: 40px;" class="text-center">STT</th>' : ""}
          ${config.showMon ? '<th style="min-width: 150px;">TÊN MÓN</th>' : ""}
          ${config.showSL ? '<th style="width: 60px;" class="text-center">SL</th>' : ""}
          ${config.showDVT ? '<th style="width: 70px;" class="text-center">ĐVT</th>' : ""}
          ${config.showDinhLuong ? '<th style="width: 100px;" class="text-center">ĐỊNH LƯỢNG</th>' : ""}
          ${config.showDonGia ? '<th style="width: 100px;" class="text-right">ĐƠN GIÁ</th>' : ""}
          ${config.showPhiKhac ? '<th style="width: 100px;" class="text-right">PHÍ KHÁC</th>' : ""}
          ${config.showThanhTien ? '<th style="width: 120px;" class="text-right">THÀNH TIỀN</th>' : ""}
        </tr>
      </thead>
      <tbody>
        ${generateItemsRows(items, config)}
      </tbody>
    </table>

    <!-- Summary -->
    <div class="summary-section">
      <table class="summary-table">
        ${generateTotalsSection(billData)}
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">Cảm ơn quý khách đã sử dụng dịch vụ!</div>
      <div class="footer-note">Đây là hóa đơn điện tử hợp lệ.</div>
      <div class="footer-contact">Hotline: 0123 456 789 | Website: vippro.vn</div>
    </div>
  </div>
</body>
</html>
  `;
};
