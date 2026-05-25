import Review from "./review.model.js";

// 📌 Crear review
export const createReview = async (req, res) => {
  try {
    const { name, country, flag, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({
        message: "name, rating y comment son obligatorios",
      });
    }

    const review = await Review.create({
      name,
      country,
      flag,
      rating,
      comment,
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      message: "Error creating review",
    });
  }
};

// 📌 Obtener reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll();
    return res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      message: "Error fetching reviews",
    });
  }
};