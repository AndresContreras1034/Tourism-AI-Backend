import Stripe from "stripe";
import env from "../../config/env.js";
import { addTokensToUser } from "./payment.service.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ======================================================
// 🔔 WEBHOOK — Stripe llama aquí al confirmar pago
// POST /api/payments/webhook
// ======================================================
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // req.body debe ser raw buffer — ver payment.routes.js
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ [WEBHOOK] Firma inválida:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log(`🔔 [WEBHOOK] Evento recibido: ${event.type}`);

  // ======================================================
  // ✅ PAGO EXITOSO
  // ======================================================
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;
    const { userId, tokens } = intent.metadata;

    if (!userId || !tokens) {
      console.error("❌ [WEBHOOK] Metadata incompleta:", intent.metadata);
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      await addTokensToUser(Number(userId), Number(tokens));
      console.log(`✅ [WEBHOOK] Tokens agregados correctamente`);
    } catch (err) {
      console.error("❌ [WEBHOOK] Error sumando tokens:", err.message);
      return res.status(500).json({ error: "Failed to add tokens" });
    }
  }

  return res.json({ received: true });
};