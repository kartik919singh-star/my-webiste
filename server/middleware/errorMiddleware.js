// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle Mongoose Validation Errors (e.g., missing required fields)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key Error (e.g., unique constraints)
  if (err.code === 11000) {
    statusCode = 400;
    const fields = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value entered for field(s): ${fields}. Please use another value.`;
  }

  // Handle Mongoose Bad ObjectId CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}. Resource not found.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

// 404 Route Not Found Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`API Endpoint Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
