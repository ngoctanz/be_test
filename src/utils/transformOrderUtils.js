export const transformOrderToIdOnly = (order) => {
  if (!order) return order;

  const transformed = { ...order };

  if (
    transformed.id_type_order &&
    typeof transformed.id_type_order === "object"
  ) {
    transformed.id_type_order = transformed.id_type_order._id;
  }
  if (transformed.idPartner && typeof transformed.idPartner === "object") {
    transformed.idPartner = transformed.idPartner._id;
  }
  if (transformed.unit && typeof transformed.unit === "object") {
    transformed.unit = transformed.unit._id;
  }

  return transformed;
};

export const transformOrdersToIdOnly = (orders) => {
  return orders.map(transformOrderToIdOnly);
};
