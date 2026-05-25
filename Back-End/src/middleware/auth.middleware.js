import jwt from "jsonwebtoken";
import env from "../config/env.js";

// 🔐 Middleware de autenticación
export const authMiddleware = (req, res, next) => {
  try {
    console.log("🔐 [AUTH] Middleware ejecutado");

    const authHeader = req.headers.authorization;

    // ✅ Validación estricta del header
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No Authorization header provided",
      });
    }

    // ✅ Validar formato Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid Authorization format (expected Bearer token)",
      });
    }

    // 🧼 Extraer token limpio
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    console.log(
      "📦 [AUTH] Token recibido:",
      token.substring(0, 20) + "..."
    );

    // 🔐 Verificar JWT
    const decoded = jwt.verify(token, env.JWT_SECRET);

    console.log("🧠 [AUTH] decoded payload:", decoded);

    // 🔥 Extraer ID de forma flexible (compatibilidad con distintos tokens)
    const userId = decoded.id || decoded.userId || decoded.sub;

    if (!userId) {
      console.error("❌ [AUTH] Token sin identificador de usuario");
      return res.status(401).json({
        success: false,
        message: "Invalid token payload: missing user id",
      });
    }

    // 👤 Setear usuario en request
    req.user = {
      id: String(userId),
      ...decoded,
    };

    console.log("🟢 [AUTH] Usuario autenticado:", req.user.id);

    next();
  } catch (error) {
    console.error("❌ [AUTH] Error:", error.message);

    // ⏰ Token expirado
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // 🚫 Token inválido
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // 💥 Error inesperado
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

// 🧪 Debug middleware opcional
export const debugAuth = (req, res, next) => {
  console.log(
    "🧠 [DEBUG AUTH] req.user:",
    req.user || "No autenticado"
  );
  next();
};