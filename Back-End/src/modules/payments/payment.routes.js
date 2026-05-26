import express from "express";
import { getPlans, createIntent } from "./payment.controller.js";
import { handleWebhook } from "./webhook.handler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

console.log("💳 [PAYMENT ROUTES] Inicializando rutas de pagos");

// ======================================================
// 📋 GET PLANES
// GET /api/payments/plans
// ======================================================
router.get("/plans", getPlans);

// ======================================================
// 💳 CREATE PAYMENT INTENT
// POST /api/payments/create-intent
// ======================================================
router.post("/create-intent", authMiddleware, createIntent);

// ======================================================
// 🔔 WEBHOOK — raw body obligatorio para Stripe
// POST /api/payments/webhook
// ======================================================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // ⚠️ NO usar express.json() aquí
  handleWebhook
);

export default router;