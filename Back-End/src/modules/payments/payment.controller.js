import { createPaymentIntent, TOKEN_PLANS } from "./payment.service.js";

// ======================================================
// 📋 GET PLANS
// GET /api/payments/plans
// ======================================================
export const getPlans = (req, res) => {
  return res.json({
    success: true,
    data: TOKEN_PLANS,
  });
};

// ======================================================
// 💳 CREATE PAYMENT INTENT
// POST /api/payments/create-intent
// ======================================================
export const createIntent = async (req, res) => {
  try {
    const { planKey } = req.body;
    const userId = req.user?.id;

    if (!planKey) {
      return res.status(400).json({
        success: false,
        error: "planKey is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const result = await createPaymentIntent(planKey, userId);

    return res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("❌ [PAYMENT CONTROLLER]", err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};