'use strict';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendPaymentSuccessEmail, sendPaymentFailedEmail } = require('../../utils/email.service');
const logger = require('../../utils/logger');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Genera un número de factura legible a partir del ID de Stripe.
 * Ejemplo: "pi_3Abc123" → "INV-2024-3ABC123"
 */
function buildInvoiceNumber(stripeId = '') {
  const year = new Date().getFullYear();
  const short = stripeId.replace(/^pi_/, '').toUpperCase().slice(0, 10);
  return `INV-${year}-${short}`;
}

/**
 * Formatea una fecha Unix (segundos) a texto legible en español.
 */
function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ── Manejadores de eventos ───────────────────────────────────────────────────

async function handlePaymentSucceeded(paymentIntent) {
  const { id, amount, currency, metadata } = paymentIntent;

  const emailPayload = {
    to: metadata.userEmail,
    userName: metadata.userName || 'Cliente',
    plan: metadata.planName || 'Premium',
    amount,                          // en centavos; email.service lo formatea
    currency,
    invoiceNumber: buildInvoiceNumber(id),
    paymentDate: formatDate(paymentIntent.created),
    dashboardUrl: process.env.FRONTEND_URL + '/dashboard',
  };

  await sendPaymentSuccessEmail(emailPayload);
  logger.info(`[webhook] payment_intent.succeeded procesado | id: ${id}`);
}

async function handlePaymentFailed(paymentIntent) {
  const { id, amount, currency, metadata, last_payment_error } = paymentIntent;

  const emailPayload = {
    to: metadata.userEmail,
    userName: metadata.userName || 'Cliente',
    plan: metadata.planName || 'Premium',
    amount,
    currency,
    invoiceNumber: buildInvoiceNumber(id),
    paymentDate: formatDate(paymentIntent.created),
    failureReason: last_payment_error?.message || 'Error desconocido',
    billingUrl: process.env.FRONTEND_URL + '/billing',
  };

  await sendPaymentFailedEmail(emailPayload);
  logger.info(`[webhook] payment_intent.payment_failed procesado | id: ${id}`);
}

// ── Controlador principal del webhook ────────────────────────────────────────

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body debe ser el raw buffer (ver configuración de Express más abajo)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`[webhook] Firma inválida: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`[webhook] Evento no manejado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    logger.error(`[webhook] Error procesando evento ${event.type}: ${err.message}`);
    // Devolvemos 200 para que Stripe no reintente — el error ya fue logueado
    return res.status(200).json({ received: true, warning: 'Email falló, ver logs' });
  }
}

module.exports = { handleWebhook };

/*
  ─────────────────────────────────────────────────────────────────────────────
  IMPORTANTE: Express necesita el body RAW (Buffer) para validar la firma.
  En tu app.js registra la ruta ANTES de cualquier json() middleware:

    app.post(
      '/api/payments/webhook',
      express.raw({ type: 'application/json' }),
      require('./modules/payments/webhook.handler').handleWebhook
    );

  Variables de entorno necesarias (.env):
    STRIPE_SECRET_KEY=sk_live_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=tu@email.com
    SMTP_PASS=tu_app_password
    SMTP_FROM="Tourism AI <no-reply@tourism-ai.com>"
    FRONTEND_URL=https://tu-dominio.com

  Instalar dependencias:
    npm install nodemailer handlebars pdfkit
  ─────────────────────────────────────────────────────────────────────────────
*/