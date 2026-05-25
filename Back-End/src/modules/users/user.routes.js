// user routes
import express from "express";
import multer from "multer";

import {
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar, // 🔥 NUEVO
} from "./user.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

console.log("👤 [USER ROUTES] Inicializando rutas de usuario");

const router = express.Router();

// =========================
// 📦 CONFIG MULTER
// =========================
const upload = multer({
  dest: "uploads/", // carpeta temporal
});

// =========================
// 📥 OBTENER USUARIO
// =========================
router.get("/", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] GET /user");

  getUserById(req, res).catch(next);
});

// =========================
// ✏️ ACTUALIZAR USUARIO
// =========================
router.patch("/", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] PATCH /user");

  updateUser(req, res).catch(next);
});

// =========================
// 📸 SUBIR AVATAR (🔥 NUEVO)
// =========================
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res, next) => {
    console.log("➡️ [ROUTE] POST /user/avatar");

    uploadAvatar(req, res).catch(next);
  }
);

// =========================
// 🗑️ ELIMINAR USUARIO
// =========================
router.delete("/", authMiddleware, async (req, res, next) => {
  console.log("➡️ [ROUTE] DELETE /user");

  deleteUser(req, res).catch(next);
});

export default router;