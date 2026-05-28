import { query } from "../../../config/db.js";

// ✈️ Stats generales del producto
export const getProductStats = async () => {
  const total = await query(`
    SELECT COUNT(*) AS total_plans FROM plans
  `);

  const bySource = await query(`
    SELECT source, COUNT(*) AS count
    FROM plans
    GROUP BY source
    ORDER BY count DESC
  `);

  const topDestinations = await query(`
    SELECT
      location_suggestion AS destination,
      COUNT(*)            AS count
    FROM plans
    WHERE location_suggestion IS NOT NULL
    GROUP BY location_suggestion
    ORDER BY count DESC
    LIMIT 10
  `);

  const perUser = await query(`
    SELECT
      ROUND(COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0), 2) AS avg_plans_per_user
    FROM plans
  `);

  const tokens = await query(`
    SELECT COALESCE(SUM(tokens_used), 0) AS total_tokens FROM plans
  `);

  return {
    total_plans:        Number(total.rows[0].total_plans),
    by_source:          bySource.rows,
    top_destinations:   topDestinations.rows,
    avg_plans_per_user: perUser.rows[0].avg_plans_per_user,
    total_tokens:       Number(tokens.rows[0].total_tokens),
  };
};

// 📅 Planes generados en el tiempo (AI vs manual)
export const getPlansTimeline = async (days = 30) => {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at)                    AS date,
      COUNT(*)                                          AS total_plans,
      COUNT(CASE WHEN source = 'ai'     THEN 1 END)    AS ai_plans,
      COUNT(CASE WHEN source = 'manual' THEN 1 END)    AS manual_plans
    FROM plans
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);

  return result.rows;
};