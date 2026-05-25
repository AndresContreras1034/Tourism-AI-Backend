// profile controller
import { query } from "../../config/db.js";

console.log("👤 [PROFILE CONTROLLER] Inicializado");

// =========================
// 💾 GUARDAR PERFIL (ONBOARDING)
// =========================
export const saveProfile = async (req, res) => {
  try {
    console.log("🧠 [PROFILE] Guardando perfil de usuario");

    const userId = req.user.id;
    const {
      originCity,
      budget,
      travelType,
      climate,
      interests,
      companions,
      duration,
    } = req.body;

    console.log("📦 [PROFILE] Datos recibidos:", req.body);

    // 🔥 verificar si ya existe perfil
    const existing = await query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      console.log("⚠️ [PROFILE] Actualizando perfil existente");

      const updated = await query(
        `UPDATE profiles
         SET origin_city = $1,
             budget = $2,
             travel_type = $3,
             climate = $4,
             interests = $5,
             companions = $6,
             duration = $7,
             updated_at = NOW()
         WHERE user_id = $8
         RETURNING *`,
        [
          originCity,
          budget,
          travelType,
          climate,
          interests,
          companions,
          duration,
          userId,
        ]
      );

      return res.json({
        success: true,
        message: "Profile updated",
        data: updated.rows[0],
      });
    }

    // 💾 crear perfil nuevo
    const result = await query(
      `INSERT INTO profiles (
        user_id,
        origin_city,
        budget,
        travel_type,
        climate,
        interests,
        companions,
        duration
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        userId,
        originCity,
        budget,
        travelType,
        climate,
        interests,
        companions,
        duration,
      ]
    );

    console.log("🟢 [PROFILE] Perfil creado correctamente");

    return res.status(201).json({
      success: true,
      message: "Profile saved",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [PROFILE ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error saving profile",
    });
  }
};

// =========================
// 📥 OBTENER PERFIL
// =========================
export const getProfile = async (req, res) => {
  try {
    console.log("📥 [PROFILE] Obteniendo perfil");

    const userId = req.user.id;

    const result = await query(
      "SELECT * FROM profiles WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn("⚠️ [PROFILE] No existe perfil");

      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    console.log("🟢 [PROFILE] Perfil encontrado");

    return res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ [PROFILE ERROR]:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error getting profile",
    });
  }
};