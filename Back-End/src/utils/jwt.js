// jwt utils
import jwt from "jsonwebtoken";
import env from "../config/env.js";

console.log("🔐 [JWT UTILS] Inicializado");

// =========================
// 🎟️ GENERAR TOKEN
// =========================
export const generateToken = (payload) => {
  try {
    console.log("🎟️ [JWT] Generando token para:", payload.id || payload);

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || "7d",
    });

    console.log("🟢 [JWT] Token generado");

    return token;
  } catch (error) {
    console.error("❌ [JWT ERROR]:", error.message);
    throw error;
  }
};

// =========================
// 🔍 VERIFICAR TOKEN
// =========================
export const verifyToken = (token) => {
  try {
    console.log("🔍 [JWT] Verificando token...");

    const decoded = jwt.verify(token, env.JWT_SECRET);

    console.log("🟢 [JWT] Token válido para user:", decoded.id);

    return decoded;
  } catch (error) {
    console.error("❌ [JWT ERROR]: Token inválido");
    throw new Error("Invalid token");
  }
};

// =========================
// 📦 DEFAULT EXPORT (IMPORT COMPATIBLE)
// =========================
export default {
  generateToken,
  verifyToken,
};