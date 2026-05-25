// user service
import { query } from "../../config/db.js";

console.log("👤 [USER SERVICE] Inicializado");

// =========================
// 📥 OBTENER USUARIO POR ID
// =========================
export const getUserByIdService = async (userId) => {
  try {
    console.log("📥 [USER SERVICE] Buscando usuario:", userId);

    const result = await query(
      `
      SELECT id, name, email, role, created_at
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn("⚠️ [USER SERVICE] Usuario no encontrado");
      return null;
    }

    console.log("🟢 [USER SERVICE] Usuario encontrado");

    return result.rows[0];
  } catch (error) {
    console.error("❌ [USER SERVICE ERROR]:", error.message);
    throw error;
  }
};

// =========================
// ✏️ ACTUALIZAR USUARIO
// =========================
export const updateUserService = async (userId, data) => {
  try {
    console.log("✏️ [USER SERVICE] Actualizando usuario:", userId);

    const { name } = data;

    const result = await query(
      `
      UPDATE users
      SET name = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email
      `,
      [name, userId]
    );

    console.log("🟢 [USER SERVICE] Usuario actualizado");

    return result.rows[0];
  } catch (error) {
    console.error("❌ [USER SERVICE ERROR]:", error.message);
    throw error;
  }
};

// =========================
// 🗑️ ELIMINAR USUARIO
// =========================
export const deleteUserService = async (userId) => {
  try {
    console.log("🗑️ [USER SERVICE] Eliminando usuario:", userId);

    await query(
      `
      DELETE FROM users
      WHERE id = $1
      `,
      [userId]
    );

    console.log("🟢 [USER SERVICE] Usuario eliminado");

    return true;
  } catch (error) {
    console.error("❌ [USER SERVICE ERROR]:", error.message);
    throw error;
  }
};