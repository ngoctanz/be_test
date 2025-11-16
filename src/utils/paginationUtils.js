export const parsePaginationParams = (query, options = {}) => {
  const defaultPage = options.defaultPage || 1;
  const defaultLimit = options.defaultLimit || 10;
  const maxLimit = options.maxLimit || 100;

  const page = Math.max(1, parseInt(query.page) || defaultPage);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || defaultLimit),
    maxLimit
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const validatePaginationParams = (page, limit) => {
  if (page < 1 || limit < 1) {
    return {
      isValid: false,
      error: "Page and limit must be greater than 0",
    };
  }
  return { isValid: true };
};

export const buildPaginationMetadata = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const parseOrderFilters = (query) => {
  const filters = {
    search: query.search?.trim() || null,
    typeOrderId: query.typeOrderId?.trim() || null,
    partnerId: query.partnerId?.trim() || null,
    dateFrom: query.dateFrom || null,
    dateTo: query.dateTo || null,
    priceMin: query.priceMin ? parseInt(query.priceMin) : null,
    priceMax: query.priceMax ? parseInt(query.priceMax) : null,
  };

  // Validate price range
  if (
    filters.priceMin !== null &&
    filters.priceMax !== null &&
    filters.priceMin > filters.priceMax
  ) {
    throw new Error("priceMin cannot be greater than priceMax");
  }

  // Validate date range
  if (filters.dateFrom && filters.dateTo) {
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);
    if (fromDate > toDate) {
      throw new Error("dateFrom cannot be after dateTo");
    }
  }

  return filters;
};
