import { query } from "../../../config/db.js";

// 📦 Ventas e ingresos por plan
export const getCatalogStats = async () => {
  const result = await query(`
    SELECT
      plan_key,
      plan_name,
      COUNT(*)         AS total_sales,
      SUM(amount)      AS total_revenue,
      ROUND(AVG(amount), 2) AS avg_amount
    FROM orders
    WHERE status = 'succeeded'
    GROUP BY plan_key, plan_name
    ORDER BY total_sales DESC
  `);

  return result.rows;
};