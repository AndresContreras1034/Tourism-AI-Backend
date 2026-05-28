import { Router } from "express";
import { getSummary, getFiltered } from "./analytics.controller.js";

const router = Router();

// Rutas públicas — datos del dataset, no datos de usuario
router.get("/summary", getSummary);
router.get("/filtered", getFiltered);

export default router;