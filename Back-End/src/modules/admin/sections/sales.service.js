import { query } from "../../../config/db.js";

// 💰 KPIs principales
export const getSalesKPIs = async () => {
  const result = await query(`
    SELECT
      COALESCE(SUM(amount), 0)                                                    AS total_revenue,
      COUNT(*)                                                                     AS total_orders,
      COUNT(DISTINCT user_id)                                                      AS unique_customers,
      ROUND(COALESCE(SUM(amount) / NULLIF(COUNT(DISTINCT user_id), 0), 0), 2)     AS arpu
    FROM orders
    WHERE status = 'succeeded'
  `);

  return result.rows[0];
};

// 🔥 Plan más vendido
export const getTopPlan = async () => {
  const result = await query(`
    SELECT plan_key, plan_name, COUNT(*) AS sales
    FROM orders
    WHERE status = 'succeeded'
    GROUP BY plan_key, plan_name
    ORDER BY sales DESC
    LIMIT 1
  `);

  return result.rows[0] || null;
};

// 📈 Ingresos en el tiempo (últimos N días)
export const getRevenueOverTime = async (days = 30) => {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at)  AS date,
      SUM(amount)                    AS revenue,
      COUNT(*)                       AS orders
    FROM orders
    WHERE status = 'succeeded'
      AND created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);

  return result.rows;
};