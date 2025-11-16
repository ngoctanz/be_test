/**
 * Format currency to Vietnamese format
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Validate bill data structure
 */
export const validateBillData = (billData) => {
  if (!billData || !billData.orderId || !billData.customerName) {
    return {
      isValid: false,
      error: "Missing required fields: orderId, customerName",
    };
  }

  if (!billData.items || !Array.isArray(billData.items)) {
    return {
      isValid: false,
      error: "Items must be an array",
    };
  }

  // Validate printConfig if provided
  if (billData.printConfig && typeof billData.printConfig !== "object") {
    return {
      isValid: false,
      error: "printConfig must be an object",
    };
  }

  return { isValid: true };
};

/**
 * Transform order data to bill export format
 */
export const transformOrderToBillData = (order) => {
  const subtotal = order.price;
  const discountAmount = (subtotal * (order.discount || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const vatAmount = (afterDiscount * (order.vat || 0)) / 100;
  const totalCharges =
    (order.transport_charge || 0) +
    (order.equipment_charge || 0) +
    (order.table_charge || 0) +
    (order.service_charge || 0) +
    (order.other_charge || 0);

  return {
    orderId: order.idOrder,
    customerName: order.customer_name,
    address: order.address || "",
    createdAt: order.order_date,
    items: order.food_list.map((item, index) => ({
      no: index + 1,
      name: item.food,
      quantity: Number(item.quantity) || 0,
      dinhLuong: item.dinhLuong || undefined,
      dvt: item.dvt || undefined,
      price: 0,
      phiKhac: 0,
      total: 0,
    })),
    subtotal,
    discount: {
      percent: order.discount || 0,
      amount: discountAmount,
    },
    afterDiscount,
    vat: {
      percent: order.vat || 0,
      amount: vatAmount,
    },
    charges: {
      transport: order.transport_charge || 0,
      equipment: order.equipment_charge || 0,
      table: order.table_charge || 0,
      service: order.service_charge || 0,
      other: order.other_charge || 0,
      total: totalCharges,
    },
    grandTotal: afterDiscount + vatAmount + totalCharges,
    printConfig: {
      showSTT: true,
      showMon: true,
      showSL: true,
      showDVT: false,
      showDinhLuong: false,
      showDonGia: true,
      showPhiKhac: false,
      showThanhTien: true,
    },
  };
};
