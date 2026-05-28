import speakeasy from "speakeasy";
import QRCode from "qrcode";

import * as mfaModel from "./mfa.model.js";
import userModel from "../users/user.model.js";
import jwt from "../../utils/jwt.js";

console.log("🔐 [MFA SERVICE] Inicializado");

// =========================
// 🔐 GENERAR SETUP MFA
// =========================
export const generateSetup = async (userId) => {
  console.log("🧪 [MFA] Generando setup para:", userId);

  const user = await userModel.getById(userId);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const existing = await mfaModel.getMfaByUserId(userId);

  // =========================
  // 🔥 SI YA EXISTE MFA → REUTILIZAR SECRET
  // =========================
  if (existing && existing.secret) {
    console.log("♻️ [MFA] MFA ya existe, reutilizando secret");

    const otpauthUrl = speakeasy.otpauthURL({
      secret: existing.secret,
      label: `TourismAI (${user.email})`,
      issuer: "TourismAI",
      encoding: "base32",
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl);

    return {
      secret: existing.secret,
      otpauthUrl,
      qrCode,
    };
  }

  // =========================
  // 🆕 CREAR NUEVO MFA SOLO SI NO EXISTE
  // =========================
  const secret = speakeasy.generateSecret({
    name: `TourismAI (${user.email})`,
  });

  console.log("🆕 [MFA] Creando nuevo secret");

  if (existing) {
    await mfaModel.updateSecret(userId, secret.base32);
  } else {
    await mfaModel.createMfaRecord({
      userId,
      secret: secret.base32,
      enabled: false,
    });
  }

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCode,
  };
};

// =========================
// 🔐 VERIFY SETUP TOKEN
// =========================
export const verifySetupToken = async (userId, token) => {
  console.log("🔐 [MFA] Verificando setup token:", userId);

  const record = await mfaModel.getMfaByUserId(userId);

  if (!record || !record.secret) {
    throw new Error("MFA no configurado");
  }

  const isValid = speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token,
    window: 2,
  });

  return isValid;
};

// =========================
// 🔐 ENABLE MFA (ACTIVACIÓN FINAL)
// =========================
export const enableMFA = async (userId) => {
  console.log("✅ [MFA] Activando MFA:", userId);

  await mfaModel.enableMfa(userId);

  await userModel.update(userId, {
    mfa_enabled: true,
  });

  return true;
};

// =========================
// 🔐 VERIFY LOGIN MFA
// =========================
export const verifyLoginToken = async (userId, token) => {
  console.log("🔐 [MFA] Verificando login MFA:", userId);

  const record = await mfaModel.getMfaByUserId(userId);

  if (!record || !record.enabled) {
    return false;
  }

  return speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token,
    window: 2,
  });
};

// =========================
// 🔐 GENERAR TOKEN LOGIN FINAL
// =========================
export const generateLoginToken = async (userId) => {
  const user = await userModel.getById(userId);

  // ✅ FIX 1: incluir role en el JWT
  // sin role, las rutas de admin fallan porque req.user.role es undefined
  const token = jwt.generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    mfa_verified: true,
  });

  // ✅ FIX 2: devolver { token, user } en lugar de solo el token
  // el controller necesita ambos para responderle al frontend
  return {
    token,
    user: {
      id:          user.id,
      email:       user.email,
      name:        user.name,
      role:        user.role,
      mfa_enabled: user.mfa_enabled,
      tokens:      user.tokens,
    },
  };
};

// =========================
// ❌ DISABLE MFA
// =========================
export const disableMFA = async (userId) => {
  console.log("❌ [MFA] Desactivando MFA:", userId);

  await mfaModel.disableMfa(userId);

  await userModel.update(userId, {
    mfa_enabled: false,
  });

  return true;
};

export default {
  generateSetup,
  verifySetupToken,
  enableMFA,
  verifyLoginToken,
  generateLoginToken,
  disableMFA,
};