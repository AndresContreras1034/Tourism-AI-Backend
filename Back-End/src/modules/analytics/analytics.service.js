import path from "path";
import { fileURLToPath } from "url";
import xlsx from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path to wherever your dataset lives in the project
const DATASET_PATH = path.resolve(
  __dirname,
  "../../assets/dataset_turismo_bogota_50k_rating.xlsx"
);

/** Load and parse the dataset once, cache it in memory */
let _cache = null;
function getDataset() {
  if (_cache) return _cache;

  const workbook = xlsx.readFile(DATASET_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  _cache = rows;
  return rows;
}

/** Helper: group by a column and count */
function countBy(rows, col) {
  const map = {};
  for (const row of rows) {
    const key = row[col];
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/** Helper: group by a column and average rating */
function avgRatingBy(rows, col) {
  const map = {};
  const counts = {};
  for (const row of rows) {
    const key = row[col];
    map[key] = (map[key] || 0) + row.rating;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, total]) => ({
      name,
      rating: parseFloat((total / counts[name]).toFixed(2)),
    }))
    .sort((a, b) => b.rating - a.rating);
}

export const analyticsService = {
  /**
   * Returns all aggregated analytics in one call.
   * The frontend can destructure what it needs.
   */
  getSummary() {
    const rows = getDataset();
    const total = rows.length;
    const avgRating = parseFloat(
      (rows.reduce((s, r) => s + r.rating, 0) / total).toFixed(2)
    );

    // KPI cards
    const kpis = {
      total_registros: total,
      avg_rating: avgRating,
      total_planes: new Set(rows.map((r) => r.plan_turistico_bogota)).size,
      total_tipos_viaje: new Set(rows.map((r) => r.tipo_viaje)).size,
    };

    // Charts
    const rating_por_presupuesto = avgRatingBy(rows, "presupuesto_cop");

    const viajes_por_tipo = countBy(rows, "tipo_viaje");

    const viajes_por_transporte = countBy(rows, "transporte_preferido");

    const viajes_por_compania = countBy(rows, "compania");

    const viajes_por_duracion = countBy(rows, "duracion");

    // Rating distribution buckets: 1-2, 2-3, 3-4, 4-5
    const ratingBuckets = { "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 };
    for (const row of rows) {
      const r = row.rating;
      if (r < 2) ratingBuckets["1-2"]++;
      else if (r < 3) ratingBuckets["2-3"]++;
      else if (r < 4) ratingBuckets["3-4"]++;
      else ratingBuckets["4-5"]++;
    }
    const distribucion_rating = Object.entries(ratingBuckets).map(
      ([name, value]) => ({ name, value })
    );

    const rating_por_tipo = avgRatingBy(rows, "tipo_viaje");

    const top_planes = countBy(rows, "plan_turistico_bogota").slice(0, 10);

    // Climate preference
    const clima_preferido = countBy(rows, "clima_preferido");

    return {
      kpis,
      rating_por_presupuesto,
      viajes_por_tipo,
      viajes_por_transporte,
      viajes_por_compania,
      viajes_por_duracion,
      distribucion_rating,
      rating_por_tipo,
      top_planes,
      clima_preferido,
    };
  },

  /**
   * Returns rows filtered by optional query params.
   * Useful for future drill-down features.
   */
  getFiltered({ tipo_viaje, presupuesto, compania, transporte } = {}) {
    let rows = getDataset();
    if (tipo_viaje) rows = rows.filter((r) => r.tipo_viaje === tipo_viaje);
    if (presupuesto)
      rows = rows.filter((r) => r.presupuesto_cop === presupuesto);
    if (compania) rows = rows.filter((r) => r.compania === compania);
    if (transporte)
      rows = rows.filter((r) => r.transporte_preferido === transporte);

    return {
      total: rows.length,
      avg_rating: parseFloat(
        (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(2)
      ),
      viajes_por_tipo: countBy(rows, "tipo_viaje"),
      top_planes: countBy(rows, "plan_turistico_bogota").slice(0, 5),
    };
  },
};