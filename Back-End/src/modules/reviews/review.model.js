import pool from "../../config/db.js";

// 🧱 TABLE NAME
const TABLE_NAME = "reviews";

// =========================
// ⭐ REVIEW MODEL (PRO)
// =========================

const ReviewModel = {
  // 📌 CREATE REVIEW
  create: async ({ name, country, flag, rating, comment }) => {
    try {
      const result = await pool.query(
        `INSERT INTO ${TABLE_NAME} (name, country, flag, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          name,
          country || "",
          flag || "🌍",
          rating,
          comment,
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Database error creating review");
    }
  },

  // 📌 GET ALL REVIEWS
  findAll: async () => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${TABLE_NAME} ORDER BY created_at DESC`
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw new Error("Database error fetching reviews");
    }
  },

  // 📌 GET BY ID (future ready)
  findById: async (id) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${TABLE_NAME} WHERE id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching review by id:", error);
      throw new Error("Database error fetching review");
    }
  },

  // 📌 DELETE (future ready)
  delete: async (id) => {
    try {
      const result = await pool.query(
        `DELETE FROM ${TABLE_NAME} WHERE id = $1 RETURNING *`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw new Error("Database error deleting review");
    }
  },
};

export default ReviewModel;