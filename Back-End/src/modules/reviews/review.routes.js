import express from "express";
import {
  createReview,
  getReviews,
} from "./review.controller.js";

const router = express.Router();

// 📌 GET all reviews
router.get("/", getReviews);

// 📌 CREATE review
router.post("/", createReview);

export default router;