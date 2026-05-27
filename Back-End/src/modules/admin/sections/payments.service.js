import { query } from "../../../config/db.js";

// 💳 Resumen general de pagos
export const getPaymentsSummary = async () => {
  const result = await query(`
    SELECT
      COUNT(CASE WHEN status = 'succeeded' THEN 1 END)                        AS successful,
      COUNT(CASE WHEN status = 'failed'    THEN 1 END)                        AS failed,
      COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount END), 0)        AS total_collected,
      ROUND(
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::NUMERIC
        / NULLIF(COUNT(*), 0) * 100
      , 2)                                                                     AS failure_rate_pct
    FROM orders
  `);

  return result.rows[0];
};

// 🌍 Pagos por ciudad de origen del usuario
export const getPaymentsByCountry = async () => {
  const result = await query(`
    SELECT
      COALESCE(p.origin_city, 'Unknown') AS country,
      COUNT(o.id)                        AS orders,
      COALESCE(SUM(o.amount), 0)         AS revenue
    FROM orders o
    LEFT JOIN profiles p ON p.user_id = o.user_id
    WHERE o.status = 'succeeded'
    GROUP BY COALESCE(p.origin_city, 'Unknown')
    ORDER BY revenue DESC
  `);

  return result.rows;
};

// 📆 Pagos exitosos vs fallidos en el tiempo
export const getPaymentsTimeline = async (days = 30) => {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at)                    AS date,
      COUNT(CASE WHEN status = 'succeeded' THEN 1 END) AS successful,
      COUNT(CASE WHEN status = 'failed'    THEN 1 END) AS failed
    FROM orders
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);

  return result.rows;
};