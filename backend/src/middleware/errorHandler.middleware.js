export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
  const value = err.keyValue ? err.keyValue[field] : "";
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return new AppError(message, 409);
};

const handleValidationErrorDB = (err) => {
  const errors = err.errors
    ? Object.values(err.errors).map((el) => el.message)
    : [err.message];
  const message = `Invalid input: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

export const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError" && (!err.statusCode || err.statusCode === 500)) {
    err.statusCode = 400;
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || (`${err.statusCode}`.startsWith("4") ? "fail" : "error");

  let error = { ...err, message: err.message, name: err.name };

  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  const statusCode = error.statusCode || err.statusCode || 500;
  const status = error.status || (`${statusCode}`.startsWith("4") ? "fail" : "error");
  const message = error.message || "Internal Server Error";

  const isDev = process.env.NODE_ENV === "development";

  return res.status(statusCode).json({
    statusCode,
    status,
    message,
    ...(isDev && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
