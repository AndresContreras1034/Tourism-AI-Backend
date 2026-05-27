import Stripe from "stripe";
import env from "../../config/env.js";
import { addTokensToUser } from "./payment.service.js";
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from "../../utils/email.service.js";
import { logInfo, logSuccess, logError } from "../../utils/logger.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildInvoiceNumber(stripeId = "") {
  const year = new Date().getFullYear();
  const short = stripeId.replace(/^pi_/, "").toUpperCase().slice(0, 10);
  return `INV-${year}-${short}`;
}

function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ── Manejadores de eventos ────────────────────────────────────────────────────

async function handlePaymentSucceeded(intent) {
  const { id, amount, currency, metadata } = intent;
  const { userId, tokens, userEmail, userName, planName } = metadata;

  // 1. Sumar tokens al usuario
  if (!userId || !tokens) {
    logError("WEBHOOK", "Metadata incompleta en payment_intent.succeeded", metadata);
    throw new Error("Missing metadata: userId or tokens");
  }

  await addTokensToUser(Number(userId), Number(tokens));
  logSuccess("WEBHOOK", `Tokens agregados | userId: ${userId} | tokens: ${tokens}`);

  // 2. Enviar email con factura PDF (solo si hay email en metadata)
  if (userEmail) {
    await sendPaymentSuccessEmail({
      to: userEmail,
      userName: userName || "Cliente",
      plan: planName || "Premium",
      amount,
      currency,
      invoiceNumber: buildInvoiceNumber(id),
      paymentDate: formatDate(intent.created),
      dashboardUrl: `${env.FRONTEND_URL}/dashboard`,
    });
    logSuccess("WEBHOOK", `Email de confirmación enviado a ${userEmail}`);
  } else {
    logInfo("WEBHOOK", "Sin userEmail en metadata — email omitido");
  }
}

async function handlePaymentFailed(intent) {
  const { id, amount, currency, metadata, last_payment_error } = intent;
  const { userEmail, userName, planName } = metadata;

  logError("WEBHOOK", `Pago fallido | id: ${id} | motivo: ${last_payment_error?.message}`);

  if (userEmail) {
    await sendPaymentFailedEmail({
      to: userEmail,
      userName: userName || "Cliente",
      plan: planName || "Premium",
      amount,
      currency,
      invoiceNumber: buildInvoiceNumber(id),
      paymentDate: formatDate(intent.created),
      failureReason: last_payment_error?.message || "Error desconocido",
      billingUrl: `${env.FRONTEND_URL}/billing`,
    });
    logSuccess("WEBHOOK", `Email de pago fallido enviado a ${userEmail}`);
  }
}

// ======================================================
// 🔔 WEBHOOK — Stripe llama aquí al confirmar pago
// POST /api/payments/webhook
// ======================================================
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logError("WEBHOOK", "Firma inválida", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  logInfo("WEBHOOK", `Evento recibido: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logInfo("WEBHOOK", `Evento no manejado: ${event.type}`);
    }
  } catch (err) {
    logError("WEBHOOK", `Error procesando ${event.type}`, err.message);
    // Respondemos 200 igual — Stripe no debe reintentar por errores internos
    return res.status(200).json({ received: true, warning: err.message });
  }

  return res.status(200).json({ received: true });
};