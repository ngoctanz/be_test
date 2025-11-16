// Parse food list from string, JSON, or array format
// Expected format: [{ food: "string", quantity: "string" }, ...]
export const parseFoodList = (foodList) => {
  if (Array.isArray(foodList)) {
    return foodList
      .filter((item) => item && item.food && item.quantity)
      .map((item) => ({
        food: String(item.food).trim(),
        quantity: String(item.quantity).trim(),
      }))
      .filter((item) => item.food !== "" && item.quantity !== "");
  }

  if (typeof foodList === "string") {
    try {
      const parsed = JSON.parse(foodList);
      if (Array.isArray(parsed)) {
        return parseFoodList(parsed);
      }
    } catch (e) {
      // If parsing fails, return empty array
      return [];
    }
  }

  return [];
};

// Parse image/video list from string, JSON, or array format
export const parseImageVideoList = (imageList) => {
  if (Array.isArray(imageList)) {
    return filterValidUrls(imageList);
  }

  if (typeof imageList === "string") {
    try {
      const parsed = JSON.parse(imageList);
      return Array.isArray(parsed) ? filterValidUrls(parsed) : [];
    } catch (e) {
      return filterValidUrls([imageList]);
    }
  }

  return [];
};

export const filterValidUrls = (urls) =>
  urls.filter((url) => url && url.trim() !== "");

export const buildOrderDataObject = (reqBody, imageVideoUrls) => {
  const foodList = parseFoodList(reqBody.food_list);

  return {
    idOrder: reqBody.idOrder,
    order_date: reqBody.order_date,
    id_type_order: reqBody.id_type_order || null,
    idPartner: reqBody.idPartner || null,
    customer_name: reqBody.customer_name,
    address: reqBody.address,
    floor: reqBody.floor || null,
    basement: reqBody.basement || null,
    customer_quantity: parseInt(reqBody.customer_quantity),
    note: reqBody.note || null,
    food_list: foodList,
    serving_time: reqBody.serving_time || null,
    price: parseFloat(reqBody.price),
    unit: reqBody.unit || null,
    discount: parseFloat(reqBody.discount) || 0,
    vat: parseFloat(reqBody.vat) || 0,
    transport_charge: parseFloat(reqBody.transport_charge) || 0,
    equipment_charge: parseFloat(reqBody.equipment_charge) || 0,
    table_charge: parseFloat(reqBody.table_charge) || 0,
    service_charge: parseFloat(reqBody.service_charge) || 0,
    other_charge: parseFloat(reqBody.other_charge) || 0,
    arrival_time: reqBody.arrival_time || null,
    transfer_time: reqBody.transfer_time || null,
    imagevideo_list: imageVideoUrls,
    idUser: reqBody.idUser,
  };
};

/**
 * Compare old and new image URLs to determine which ones to delete
 * Returns array of public IDs from Cloudinary that should be deleted
 */
export const getUrlsToDelete = (oldUrls = [], newUrls = []) => {
  const oldUrlSet = new Set(filterValidUrls(oldUrls));
  const newUrlSet = new Set(filterValidUrls(newUrls));

  const urlsToDelete = Array.from(oldUrlSet).filter(
    (url) => !newUrlSet.has(url)
  );

  return urlsToDelete;
};

/**
 * Extract Cloudinary public IDs from URLs for deletion
 */
export const extractPublicIdsFromUrls = (urls, cloudinaryService) => {
  return urls.map((url) => cloudinaryService.extractPublicId(url));
};

export const processOrderMedia = async ({
  files = [],
  currentImageUrls = [],
  newImageUrls = [],
  cloudinaryService,
}) => {
  let allImageUrls = [...newImageUrls];

  // Upload new files if provided
  if (files && files.length > 0) {
    const uploaded = await cloudinaryService.uploadMultipleImages(
      files,
      "party-management/orders"
    );
    allImageUrls = [...allImageUrls, ...uploaded.map((u) => u.url)];
  }

  // Find and delete URLs that are no longer needed
  const urlsToDelete = getUrlsToDelete(currentImageUrls, allImageUrls);
  if (urlsToDelete.length > 0) {
    try {
      const publicIds = extractPublicIdsFromUrls(
        urlsToDelete,
        cloudinaryService
      );
      if (publicIds.length > 0) {
        await cloudinaryService.deleteMultipleImages(publicIds);
      }
    } catch (error) {
      console.error("Error deleting images from Cloudinary:", error);
    }
  }

  return filterValidUrls(allImageUrls);
};
