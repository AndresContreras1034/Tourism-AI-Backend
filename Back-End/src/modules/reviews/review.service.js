const pool = require("../../config/db");

// 📌 Crear review (lógica de negocio)
const createReview = async ({ name, country, flag, rating, comment }) => {
  if (!name || !rating || !comment) {
    throw new Error("Missing required fields");
  }

  const result = await pool.query(
    `INSERT INTO reviews (name, country, flag, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, country || "", flag || "🌍", rating, comment]
  );

  return result.rows[0];
};

// 📌 Obtener todas las reviews
const getReviews = async () => {
  const result = await pool.query(
    `SELECT * FROM reviews ORDER BY created_at DESC`
  );

  return result.rows;
};

module.exports = {
  createReview,
  getReviews,
};