const pool = require("../../config/db");

// =========================
// 📌 CREATE REVIEW
// =========================
const createReview = async ({ name, country, flag, rating, comment }) => {
  try {
    console.log("🟡 [REVIEWS] Creating review:", {
      name,
      country,
      flag,
      rating,
      comment,
    });

    // 🔥 validación más fuerte
    if (!name?.trim() || !rating || !comment?.trim()) {
      throw new Error("Missing required fields");
    }

    const result = await pool.query(
      `
      INSERT INTO reviews (name, country, flag, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        name.trim(),
        country?.trim() || "",
        flag || "🌍",
        rating,
        comment.trim(),
      ]
    );

    console.log("🟢 [REVIEWS] Created:", result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.error("🔴 [REVIEWS] createReview error:", error.message);
    throw error;
  }
};

// =========================
// 📌 GET REVIEWS
// =========================
const getReviews = async () => {
  try {
    console.log("🟡 [REVIEWS] Fetching all reviews...");

    const result = await pool.query(
      `
      SELECT *
      FROM reviews
      ORDER BY created_at DESC
      `
    );

    console.log(`🟢 [REVIEWS] Found ${result.rowCount} reviews`);

    return result.rows;
  } catch (error) {
    console.error("🔴 [REVIEWS] getReviews error:", error.message);
    throw error;
  }
};

module.exports = {
  createReview,
  getReviews,
};