// user controller
import { query } from "../../config/db.js";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";

console.log("👤 [USER CONTROLLER] Inicializado");

// =========================
// 📥 OBTENER USUARIO POR ID
// =========================
export const getUserById = async (req, res) => {
  try {
    console.log("📥 [USER] Obteniendo usuario...");

    const userId = req.user.id;

    const result = await query(
      `
      SELECT id, email, name, avatar, created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn("⚠️ [USER] Usuario no encontrado");

      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("🟢 [USER] Usuario encontrado");

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [USER ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error getting user",
    });
  }
};

// =========================
// ✏️ ACTUALIZAR USUARIO
// =========================
export const updateUser = async (req, res) => {
  try {
    console.log("✏️ [USER] Actualizando usuario...");

    const userId = req.user.id;
    const { name } = req.body;

    const result = await query(
      `
      UPDATE users
      SET name = $1
      WHERE id = $2
      RETURNING id, email, name, avatar
      `,
      [name, userId]
    );

    console.log("🟢 [USER] Usuario actualizado");

    return res.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [USER ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

// =========================
// 📸 SUBIR AVATAR
// =========================
export const uploadAvatar = async (req, res) => {
  try {
    console.log("📸 [USER] Subiendo avatar...");

    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se envió archivo",
      });
    }

    // ☁️ subir a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      transformation: [
        { width: 300, height: 300, crop: "fill" }, // 🔥 optimización automática
      ],
    });

    // 🧹 borrar archivo local
    fs.unlinkSync(req.file.path);

    // 🗄️ guardar URL en BD
    const updatedUser = await query(
      `
      UPDATE users
      SET avatar = $1
      WHERE id = $2
      RETURNING id, email, name, avatar
      `,
      [result.secure_url, userId]
    );

    console.log("🟢 [USER] Avatar actualizado");

    return res.json({
      success: true,
      message: "Avatar actualizado",
      data: updatedUser.rows[0],
    });

  } catch (error) {
    console.error("❌ [UPLOAD ERROR]:", error);

    return res.status(500).json({
      success: false,
      message: "Error subiendo avatar",
    });
  }
};

// =========================
// 🗑️ ELIMINAR USUARIO
// =========================
export const deleteUser = async (req, res) => {
  try {
    console.log("🗑️ [USER] Eliminando usuario...");

    const userId = req.user.id;

    await query(
      "DELETE FROM users WHERE id = $1",
      [userId]
    );

    console.log("🟢 [USER] Usuario eliminado");

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ [USER ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};