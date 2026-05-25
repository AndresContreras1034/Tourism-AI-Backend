import express from "express";
import mfaService from "./mfa.service.js";

const router = express.Router();

const {
  generateSetup,
  verifySetupToken,
  enableMFA,
  verifyLoginToken,
} = mfaService;

console.log("🔐 [MFA ROUTES] Inicializadas");

// =========================
// 🔐 GENERAR QR SETUP
// =========================
// ⚠️ NO authMiddleware → onboarding todavía no tiene sesión final
router.post("/setup", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId requerido",
      });
    }

    console.log("🔥 [MFA SETUP] userId:", userId);

    const result = await generateSetup(userId);

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ [MFA SETUP ERROR]:", error);

    return res.status(500).json({
      success: false,
      message: "Error generating MFA setup",
    });
  }
});

// =========================
// 🔐 VERIFY SETUP (ACTIVAR MFA)
// =========================
// ⚠️ NO authMiddleware (onboarding flow)
router.post("/verify-setup", async (req, res) => {
  try {
    const { userId, token } = req.body;

    console.log("🔐 [MFA VERIFY SETUP]", { userId, token });

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "userId y token requeridos",
      });
    }

    const valid = await verifySetupToken(userId, token);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid MFA token",
      });
    }

    await enableMFA(userId);

    return res.json({
      success: true,
      message: "MFA enabled successfully",
    });

  } catch (error) {
    console.error("❌ [MFA VERIFY ERROR]:", error);

    return res.status(500).json({
      success: false,
      message: "Error verifying MFA",
    });
  }
});

// =========================
// 🔐 VERIFY LOGIN MFA
// =========================
// ⚠️ usuario todavía NO tiene sesión final activa
router.post("/verify-login", async (req, res) => {
  try {
    const { userId, token } = req.body;

    console.log("🔐 [MFA LOGIN VERIFY]", { userId, token });

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: "userId y token requeridos",
      });
    }

    const valid = await verifyLoginToken(userId, token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid MFA code",
      });
    }

    return res.json({
      success: true,
      message: "MFA verified",
    });

  } catch (error) {
    console.error("❌ [MFA LOGIN ERROR]:", error);

    return res.status(500).json({
      success: false,
      message: "Error verifying MFA login",
    });
  }
});

export default router;