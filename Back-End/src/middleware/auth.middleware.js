import jwt from "jsonwebtoken";
import env from "../config/env.js";

// 🔐 Middleware de autenticación
export const authMiddleware = (req, res, next) => {
  try {
    console.log("🔐 [AUTH] Middleware ejecutado");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    console.log("📦 [AUTH] Token recibido:", token.substring(0, 20) + "...");

    const decoded = jwt.verify(token, env.JWT_SECRET);

    console.log("🧠 [AUTH] decoded payload:", decoded);

    // 🔥 FIX CRÍTICO: normalizar estructura del usuario
    const userId =
      decoded.id ||
      decoded.userId ||
      decoded.sub;

    if (!userId) {
      console.error("❌ [AUTH] Token sin identificador de usuario");
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    console.log("🟢 [AUTH] Usuario autenticado:", userId);

    req.user = {
      id: userId,
      ...decoded,
    };

    next();

  } catch (error) {
    console.error("❌ [AUTH] Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      message: "Authentication error",
    });
  }
};

// 🔥 Debug opcional
export const debugAuth = (req, res, next) => {
  console.log("🧠 [DEBUG AUTH] req.user:", req.user || "No autenticado");
  next();
};