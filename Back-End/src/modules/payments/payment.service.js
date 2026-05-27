import Stripe from "stripe";
import env from "../../config/env.js";
import { query } from "../../config/db.js";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// ======================================================
// 💰 PLANES DE TOKENS
// ======================================================
export const TOKEN_PLANS = {
  basic:   { tokens: 10,   amount: 299,  currency: "usd", label: "Básico" },
  pro:     { tokens: 50,   amount: 999,  currency: "usd", label: "Pro" },
  premium: { tokens: 9999, amount: 1999, currency: "usd", label: "Premium" },
};

// ======================================================
// 🔧 CREAR PAYMENT INTENT
// ======================================================
export const createPaymentIntent = async (planKey, userId) => {
  const plan = TOKEN_PLANS[planKey];

  if (!plan) {
    throw new Error(`Plan inválido: ${planKey}`);
  }

  // 👤 Obtener datos del usuario para la factura
  const userResult = await query(
    `SELECT name, email FROM users WHERE id = $1`,
    [userId]
  );

  const user = userResult.rows[0];

  if (!user) {
    throw new Error(`Usuario no encontrado: ${userId}`);
  }

  console.log(`💳 [PAYMENT] Creando intent para plan ${planKey} - usuario ${userId}`);

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   plan.amount,
    currency: plan.currency,
    metadata: {
      userId:    String(userId),
      planKey,
      tokens:    String(plan.tokens),
      // ✅ Campos necesarios para el email y el PDF
      userEmail: user.email,
      userName:  user.name,
      planName:  plan.label,
    },
  });

  console.log(`✅ [PAYMENT] Intent creado: ${paymentIntent.id}`);

  return {
    clientSecret: paymentIntent.client_secret,
    plan,
  };
};

// ======================================================
// 🪙 SUMAR TOKENS AL USUARIO
// ======================================================
export const addTokensToUser = async (userId, tokens) => {
  console.log(`🪙 [PAYMENT] Sumando ${tokens} tokens al usuario ${userId}`);

  const result = await query(
    `UPDATE users SET tokens = tokens + $1 WHERE id = $2 RETURNING tokens`,
    [tokens, userId]
  );

  const newTokens = result.rows[0]?.tokens;

  console.log(`✅ [PAYMENT] Usuario ${userId} ahora tiene ${newTokens} tokens`);

  return newTokens;
};