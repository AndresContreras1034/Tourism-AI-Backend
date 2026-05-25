console.log("🚨 [ERROR MIDDLEWARE] Inicializado");

const errorMiddleware = (err, req, res, next) => {
  console.error("\n❌ [GLOBAL ERROR]");

  console.error("➡️ Method:", req.method);
  console.error("➡️ URL:", req.originalUrl);
  console.error("➡️ Message:", err.message);
  console.error("➡️ Stack:", err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate key error";
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Foreign key constraint error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;