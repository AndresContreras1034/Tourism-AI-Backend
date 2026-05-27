import express from "express";
import cors from "cors";

import env from "./config/env.js";
import { query } from "./config/db.js";

// 🧱 Models (DDL scripts)
import { createUsersTable }   from "./modules/users/user.model.js";
import { createProfilesTable } from "./modules/onboarding/profile.model.js";
import { createPlansTable }   from "./modules/plans/plan.model.js";
import { createReviewsTable } from "./modules/reviews/review.schema.js";

// 🔐 Routes
import authRoutes    from "./modules/auth/auth.routes.js";
import userRoutes    from "./modules/users/user.routes.js";
import profileRoutes from "./modules/onboarding/profile.routes.js";
import planRoutes    from "./modules/plans/plan.routes.js";
import reviewRoutes  from "./modules/reviews/review.routes.js";
import mfaRoutes     from "./modules/mfa/mfa.routes.js";

// 🧠 AI
import aiRoutes from "./modules/ai/ai.routes.js";

// 💳 PAYMENTS
import paymentRoutes from "./modules/payments/payment.routes.js";

// 🛡 ADMIN
import adminRoutes from "./modules/admin/admin.routes.js";

// 🧠 Utils
import { logInfo, logSuccess, logError } from "./utils/logger.js";
import errorMiddleware from "./middleware/error.middleware.js";

console.log("🚀 [APP] Inicializando aplicación...");

const app = express();

/* =========================================================
   🔧 MIDDLEWARES
   ⚠️ El webhook de Stripe necesita raw body ANTES de json()
   Por eso se registra su ruta ANTES de express.json()
========================================================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ⚠️ WEBHOOK — raw body, va ANTES de express.json()
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// JSON para todo lo demás
app.use(express.json());

logInfo("APP", "Middlewares cargados correctamente");

/* =========================================================
   🌍 HEALTH CHECK
========================================================= */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Tourism AI API running",
    env: process.env.NODE_ENV || "development",
  });
});

/* =========================================================
   🔐 ROUTES
========================================================= */

// AUTH
app.use("/api/auth", authRoutes);

// USERS
app.use("/api/users", userRoutes);

// PROFILE
app.use("/api/profiles", profileRoutes);

// PLANS
app.use("/api/plans", planRoutes);

// REVIEWS
app.use("/api/reviews", reviewRoutes);

// MFA
app.use("/api/mfa", mfaRoutes);

// 🧠 AI (chat + plans + enrich + recommendations)
app.use("/api/ai", aiRoutes);

// 💳 PAYMENTS (Stripe)
app.use("/api/payments", paymentRoutes);

// 🛡 ADMIN (superadmin only)
app.use("/api/admin", adminRoutes);

logSuccess("APP", "Rutas registradas correctamente");

/* =========================================================
   🧪 INIT DATABASE
========================================================= */
const initDB = async () => {
  try {
    logInfo("DB", "Verificando conexión con PostgreSQL...");

    await query("SELECT 1");

    logInfo("DB", "Creando tablas si no existen...");

    await query(createUsersTable);
    await query(createProfilesTable);
    await query(createPlansTable);
    await query(createReviewsTable);

    logSuccess("DB", "Base de datos lista correctamente");
  } catch (error) {
    logError("DB", "Error inicializando base de datos", error);
    throw new Error("DB_INIT_FAILED");
  }
};

/* =========================================================
   ❌ ERROR HANDLER
========================================================= */
app.use(errorMiddleware);

/* =========================================================
   🚀 BOOT SEGURO
========================================================= */
const startApp = async () => {
  try {
    await initDB();
    logSuccess("APP", "Sistema inicializado correctamente");
  } catch (err) {
    logError("APP", "Fallo crítico al iniciar app", err);
    process.exit(1);
  }
};

startApp();

export default app;