import { Router } from "express";
import { requireSuperAdmin } from "./admin.middleware.js";
import {
  getSales,
  getCatalog,
  getMap,
  getProduct,
  getPayments,
  getOverview,
  getUsers,
  getUserById,
  patchUserRole,
} from "./admin.controller.js";

const router = Router();

// Todas las rutas protegidas por superadmin
router.use(requireSuperAdmin);

// 📊 Dashboard principal
router.get("/overview", getOverview);

// 💰 Panel de ventas
router.get("/sales", getSales);

// 📦 Catálogo de planes
router.get("/catalog", getCatalog);

// 🌍 Mapa de usuarios y destinos
router.get("/map", getMap);

// 🧳 Producto turístico
router.get("/product", getProduct);

// 💳 Pagos Stripe
router.get("/payments", getPayments);

// 👥 Usuarios
router.get("/users",            getUsers);
router.get("/users/:id",        getUserById);
router.patch("/users/:id/role", patchUserRole);

export default router;