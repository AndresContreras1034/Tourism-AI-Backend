import { analyticsService } from "./analytics.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * GET /api/analytics/summary
 * Returns all aggregated metrics for the dataset dashboard.
 */
export const getSummary = (req, res) => {
  try {
    logInfo("ANALYTICS", "Fetching dataset summary");
    const data = analyticsService.getSummary();
    res.json({ ok: true, data });
  } catch (error) {
    logError("ANALYTICS", "Error fetching summary", error);
    res.status(500).json({ ok: false, message: "Error al obtener analytics" });
  }
};

/**
 * GET /api/analytics/filtered
 * Query params: tipo_viaje, presupuesto, compania, transporte
 */
export const getFiltered = (req, res) => {
  try {
    const { tipo_viaje, presupuesto, compania, transporte } = req.query;
    logInfo("ANALYTICS", "Fetching filtered analytics", req.query);
    const data = analyticsService.getFiltered({
      tipo_viaje,
      presupuesto,
      compania,
      transporte,
    });
    res.json({ ok: true, data });
  } catch (error) {
    logError("ANALYTICS", "Error fetching filtered analytics", error);
    res
      .status(500)
      .json({ ok: false, message: "Error al filtrar analytics" });
  }
};