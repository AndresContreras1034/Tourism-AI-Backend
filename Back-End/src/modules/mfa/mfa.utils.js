const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// =========================
// 🔐 GENERAR SECRET TOTP
// =========================
const generateSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `TourismAI (${email})`,
    length: 20,
  });

  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

// =========================
// 🧾 GENERAR QR CODE (BASE64)
// =========================
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return qrCode;
  } catch (error) {
    throw new Error("Error generando QR code");
  }
};

// =========================
// 🔐 VERIFICAR TOKEN TOTP
// =========================
const verifyToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // permite ligera tolerancia de tiempo
  });
};

// =========================
// ⏱️ GENERAR OTP ACTUAL (DEBUG / TEST)
// =========================
const generateCurrentToken = (secret) => {
  return speakeasy.totp({
    secret,
    encoding: "base32",
  });
};

// =========================
// 📦 EXPORTS
// =========================
module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateCurrentToken,
};