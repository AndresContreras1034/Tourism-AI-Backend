import jwt from "jsonwebtoken";
import env from "../../config/env.js";

console.log("🔐 [AUTH MIDDLEWARE] Inicializado");

// =========================
// 🔐 AUTH MIDDLEWARE
// =========================
export const authMiddleware = (req, res, next) => {
  try {
    console.log("\n🔐 [AUTH] Verificando autenticación...");
    console.log("➡️ URL:", req.originalUrl);

    const authHeader = req.headers.authorization;

    // =========================
    // ❌ NO HEADER
    // =========================
    if (!authHeader) {
      console.warn("⚠️ [AUTH] Authorization header missing");

      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    // =========================
    // 🔥 VALIDACIÓN BEARER
    // =========================
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.warn("⚠️ [AUTH] Token mal formado");

      return res.status(401).json({
        success: false,
        message: "Invalid authorization format (Bearer token)",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    console.log("📦 [AUTH] Token recibido:", token.substring(0, 20) + "...");

    // =========================
    // 🔐 VERIFY JWT
    // =========================
    const decoded = jwt.verify(token, env.JWT_SECRET);

    console.log("🧠 [AUTH] Decoded payload:", decoded);

    // =========================
    // 💥 NORMALIZAR USER ID
    // =========================
    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.sub;

    if (!userId) {
      console.error("❌ [AUTH] Token sin userId válido");

      return res.status(401).json({
        success: false,
        message: "Invalid token payload (no user id)",
      });
    }

    console.log("🟢 [AUTH] Usuario autenticado:", userId);

    // =========================
    // 🧠 ATTACH USER
    // =========================
    req.user = {
      id: userId,
      ...decoded,
    };

    next();

  } catch (error) {
    console.error("❌ [AUTH] Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// =========================
// 🧠 DEBUG MIDDLEWARE
// =========================
export const debugAuth = (req, res, next) => {
  console.log("\n🧠 [DEBUG AUTH]");
  console.log("User:", req.user || "No autenticado");
  console.log("Auth header:", req.headers.authorization || "No header");

  next();
};