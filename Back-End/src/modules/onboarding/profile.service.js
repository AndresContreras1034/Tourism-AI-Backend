// profile service
import { query } from "../../config/db.js";

console.log("👤 [PROFILE SERVICE] Inicializado");

// =========================
// 💾 CREAR / ACTUALIZAR PERFIL
// =========================
export const upsertProfile = async (userId, profileData) => {
  console.log("🧠 [PROFILE SERVICE] Upsert perfil iniciado");
  console.log("👤 User ID:", userId);
  console.log("📦 Data:", profileData);

  const {
    originCity,
    budget,
    travelType,
    climate,
    interests,
    companions,
    duration,
  } = profileData;

  // 🔍 verificar si existe perfil
  const existing = await query(
    "SELECT id FROM profiles WHERE user_id = $1",
    [userId]
  );

  // =========================
  // 🔁 UPDATE
  // =========================
  if (existing.rows.length > 0) {
    console.log("⚠️ [PROFILE SERVICE] Actualizando perfil existente");

    const result = await query(
      `
      UPDATE profiles
      SET
        origin_city = $1,
        budget = $2,
        travel_type = $3,
        climate = $4,
        interests = $5,
        companions = $6,
        duration = $7,
        updated_at = NOW()
      WHERE user_id = $8
      RETURNING *
      `,
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

    console.log("🟢 [PROFILE SERVICE] Perfil actualizado");

    return result.rows[0];
  }

  // =========================
  // ➕ INSERT
  // =========================
  console.log("🆕 [PROFILE SERVICE] Creando nuevo perfil");

  const result = await query(
    `
    INSERT INTO profiles (
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
    RETURNING *
    `,
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

  console.log("🟢 [PROFILE SERVICE] Perfil creado");

  return result.rows[0];
};

// =========================
// 📥 OBTENER PERFIL
// =========================
export const getProfileByUserId = async (userId) => {
  console.log("📥 [PROFILE SERVICE] Buscando perfil:", userId);

  const result = await query(
    "SELECT * FROM profiles WHERE user_id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    console.warn("⚠️ [PROFILE SERVICE] Perfil no encontrado");
    return null;
  }

  console.log("🟢 [PROFILE SERVICE] Perfil encontrado");

  return result.rows[0];
};