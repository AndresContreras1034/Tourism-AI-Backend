// user routes
import express from "express";
import multer from "multer";

import {
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
} from "./user.controller.js";

import { authMiddleware } from "../auth/auth.middleware.js";

console.log("👤 [USER ROUTES] Inicializando rutas de usuario");

const router = express.Router();

/* =========================================================
   📦 MULTER CONFIG
========================================================= */
const upload = multer({
  dest: "uploads/",
});

/* =========================================================
   📥 GET USER
========================================================= */
router.get("/", authMiddleware, getUserById);

/* =========================================================
   ✏️ UPDATE USER
========================================================= */
router.patch("/", authMiddleware, updateUser);

/* =========================================================
   📸 UPLOAD AVATAR
========================================================= */
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatar
);

/* =========================================================
   🗑️ DELETE USER
========================================================= */
router.delete("/", authMiddleware, deleteUser);

export default router;