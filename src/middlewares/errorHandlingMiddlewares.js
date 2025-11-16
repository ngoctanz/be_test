import { StatusCodes } from "http-status-codes";

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = StatusCodes.NOT_FOUND;
  next(error);
};

const fieldNameMap = {
  idOrder: "Mã bàn tiệc",
  idUser: "Mã người dùng",
  idPartner: "Mã đối tác",
  email: "Email",
  phone: "Số điện thoại",
  username: "Tên người dùng",
};

// Get Vietnamese field name
const getVietnameseName = (fieldName) => {
  return fieldNameMap[fieldName] || fieldName;
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const vietnameseName = getVietnameseName(field);
  const value = err.keyValue[field];

  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: `${vietnameseName} "${value}" đã tồn tại. Vui lòng sử dụng giá trị khác.`,
  };
};

// Handle MongoDB Validation Error
const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((error) => {
    const fieldName = error.path;
    const vietnameseName = getVietnameseName(fieldName);
    return error.message.replace(fieldName, vietnameseName);
  });

  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: messages.join("; "),
  };
};

// Handle MongoDB CastError (invalid ObjectId)
const handleCastError = (err) => {
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: `Giá trị không hợp lệ cho ${err.path}: "${err.value}". Vui lòng kiểm tra lại.`,
  };
};

export const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu err là chuỗi, chuyển thành object Error
  if (typeof err === "string") {
    err = new Error(err);
  }

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Lỗi máy chủ. Vui lòng liên hệ hỗ trợ.";

  // Handle MongoDB Duplicate Key Error (11000)
  if (err.code === 11000) {
    const { statusCode: code, message: msg } = handleDuplicateKeyError(err);
    statusCode = code;
    message = msg;
  }
  // Handle MongoDB Validation Error
  else if (err.name === "ValidationError") {
    const { statusCode: code, message: msg } = handleValidationError(err);
    statusCode = code;
    message = msg;
  }
  // Handle MongoDB CastError (invalid ObjectId)
  else if (err.name === "CastError") {
    const { statusCode: code, message: msg } = handleCastError(err);
    statusCode = code;
    message = msg;
  } else if (err.message) {
    message = err.message;
  }

  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  const responseError = {
    success: false,
    statusCode,
    message,
  };

  if (process.env.NODE_ENV === "dev") {
    responseError.stack = err.stack;
    responseError.error = err;
  }

  res.status(statusCode).json(responseError);
};
