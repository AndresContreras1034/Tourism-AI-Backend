import { getSalesKPIs, getTopPlan, getRevenueOverTime }                          from "./sections/sales.service.js";
import { getCatalogStats }                                                         from "./sections/catalog.service.js";
import { getUsersByCountry, getTopDestinations, getPlansOverTime }                from "./sections/map.service.js";
import { getProductStats, getPlansTimeline }                                      from "./sections/product.service.js";
import { getPaymentsSummary, getPaymentsByCountry, getPaymentsTimeline }          from "./sections/payments.service.js";
import { getGlobalOverview, getUsersList, getUserDetail, updateUserRole }          from "./admin.service.js";

// ======================================================
// 📊 OVERVIEW — Home del dashboard
// GET /api/admin/overview
// ======================================================
export const getOverview = async (req, res) => {
  try {
    const data = await getGlobalOverview();
    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [ADMIN] getOverview:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 💰 SALES — Panel de ventas
// GET /api/admin/sales
// ======================================================
export const getSales = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const [kpis, topPlan, revenueOverTime] = await Promise.all([
      getSalesKPIs(),
      getTopPlan(),
      getRevenueOverTime(days),
    ]);

    return res.json({
      success: true,
      data: { kpis, top_plan: topPlan, revenue_over_time: revenueOverTime },
    });
  } catch (err) {
    console.error("❌ [ADMIN] getSales:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 📦 CATALOG — Planes vendidos
// GET /api/admin/catalog
// ======================================================
export const getCatalog = async (req, res) => {
  try {
    const stats = await getCatalogStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error("❌ [ADMIN] getCatalog:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 🌍 MAP — Usuarios y destinos
// GET /api/admin/map
// ======================================================
export const getMap = async (req, res) => {
  try {
    const days  = Number(req.query.days)  || 30;
    const limit = Number(req.query.limit) || 10;

    const [byCountry, topDestinations, plansOverTime] = await Promise.all([
      getUsersByCountry(),
      getTopDestinations(limit),
      getPlansOverTime(days),
    ]);

    return res.json({
      success: true,
      data: {
        users_by_country: byCountry,
        top_destinations: topDestinations,
        plans_over_time:  plansOverTime,
      },
    });
  } catch (err) {
    console.error("❌ [ADMIN] getMap:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 🧳 PRODUCT — Producto turístico
// GET /api/admin/product
// ======================================================
export const getProduct = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const [stats, timeline] = await Promise.all([
      getProductStats(),
      getPlansTimeline(days),
    ]);

    return res.json({ success: true, data: { stats, timeline } });
  } catch (err) {
    console.error("❌ [ADMIN] getProduct:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 💳 PAYMENTS — Stripe
// GET /api/admin/payments
// ======================================================
export const getPayments = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    const [summary, byCountry, timeline] = await Promise.all([
      getPaymentsSummary(),
      getPaymentsByCountry(),
      getPaymentsTimeline(days),
    ]);

    return res.json({
      success: true,
      data: { summary, by_country: byCountry, timeline },
    });
  } catch (err) {
    console.error("❌ [ADMIN] getPayments:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 👥 USERS — Lista paginada
// GET /api/admin/users
// ======================================================
export const getUsers = async (req, res) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 20;
    const data  = await getUsersList(page, limit);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [ADMIN] getUsers:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================================================
// 🔍 USER DETAIL
// GET /api/admin/users/:id
// ======================================================
export const getUserById = async (req, res) => {
  try {
    const data = await getUserDetail(Number(req.params.id));
    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [ADMIN] getUserById:", err.message);
    return res.status(404).json({ success: false, error: err.message });
  }
};

// ======================================================
// 🔑 PATCH ROLE
// PATCH /api/admin/users/:id/role
// ======================================================
export const patchUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const data = await updateUserRole(Number(req.params.id), role);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("❌ [ADMIN] patchUserRole:", err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};