import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { generatePlans, generateChatResponse } from "./ai.service.js";

const router = express.Router();

console.log("🤖 [AI ROUTES] Inicializando rutas de IA");

// ======================================================
// ✈️ GENERAR PLANES
// ======================================================
router.post("/generate-plans", authMiddleware, async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧠 [AI PLANS] Request recibido");
  console.log("👤 Headers auth OK");

  try {
    const profile = req.body;

    console.log("📦 [AI PLANS] Profile recibido:");
    console.log(profile);

    const result = await generatePlans(profile);

    console.log("🟢 [AI PLANS] Resultado generado correctamente");
    console.log(result);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("❌ [AI PLANS ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Error generating plans",
    });
  }
});

// ======================================================
// 💬 CHAT IA (TU CASO PRINCIPAL)
// ======================================================
router.post("/chat", async (req, res) => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("💬 [AI CHAT] Request recibido");

  try {
    const { message } = req.body;

    console.log("📩 [AI CHAT] Mensaje del usuario:");
    console.log(message);

    if (!message || !message.trim()) {
      console.log("⚠️ [AI CHAT] Mensaje vacío");

      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await generateChatResponse(message);

    console.log("🟢 [AI CHAT] Respuesta generada:");
    console.log(response);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("❌ [AI CHAT ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Error in chat",
    });
  }
});

// ======================================================
// 🧪 TEST
// ======================================================
router.get("/test", (req, res) => {
  console.log("🧪 [AI TEST] Endpoint ejecutado");

  return res.json({
    success: true,
    message: "AI module working correctly",
  });
});

export default router;