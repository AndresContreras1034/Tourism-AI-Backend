import { query } from "../../config/db.js";
import cloudinary from "../../utils/cloudinary.js";
import fs from "fs";

console.log("👤 [USER CONTROLLER] Inicializado");

// =========================
// 📥 OBTENER USUARIO POR ID
// =========================
export const getUserById = async (req, res) => {
  try {
    console.log("\n📥 [USER] Obteniendo usuario...");

    // 🔥 FIX CRÍTICO: normalizar tipo
    const userId = Number(req.user?.id);

    console.log("🧠 [USER] req.user:", req.user);
    console.log("🧠 [USER] userId normalizado:", userId);

    if (!userId || Number.isNaN(userId)) {
      console.error("❌ [USER] userId inválido");
      return res.status(400).json({
        success: false,
        message: "Invalid user id from token",
      });
    }

    const result = await query(
      `
      SELECT id, email, name, avatar, created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    console.log("📊 [USER] Rows returned:", result.rowCount);

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
    console.error("❌ [USER ERROR FULL]:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error getting user",
    });
  }
};

// =========================
// ✏️ ACTUALIZAR USUARIO
// =========================
export const updateUser = async (req, res) => {
  try {
    console.log("\n✏️ [USER] Actualizando usuario...");

    const userId = Number(req.user?.id);
    const { name } = req.body;

    console.log("🧠 [UPDATE] userId:", userId);
    console.log("🧠 [UPDATE] body:", req.body);

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
    console.error("❌ [UPDATE USER ERROR FULL]:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error updating user",
    });
  }
};

// =========================
// 📸 SUBIR AVATAR
// =========================
export const uploadAvatar = async (req, res) => {
  try {
    console.log("\n📸 [USER] Subiendo avatar...");

    const userId = Number(req.user?.id);

    console.log("🧠 [AVATAR] userId:", userId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se envió archivo",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      transformation: [
        { width: 300, height: 300, crop: "fill" },
      ],
    });

    fs.unlinkSync(req.file.path);

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
    console.error("❌ [UPLOAD AVATAR ERROR FULL]:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error subiendo avatar",
    });
  }
};

// =========================
// 🗑️ ELIMINAR USUARIO
// =========================
export const deleteUser = async (req, res) => {
  try {
    console.log("\n🗑️ [USER] Eliminando usuario...");

    const userId = Number(req.user?.id);

    console.log("🧠 [DELETE] userId:", userId);

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
    console.error("❌ [DELETE USER ERROR FULL]:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting user",
    });
  }
};