import { query } from "../../../config/db.js";

// 📍 Usuarios por ciudad de origen
export const getUsersByCountry = async () => {
  const result = await query(`
    SELECT
      COALESCE(p.origin_city, 'Unknown') AS country,
      COUNT(DISTINCT u.id)               AS users
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    GROUP BY COALESCE(p.origin_city, 'Unknown')
    ORDER BY users DESC
  `);

  return result.rows;
};

// 🔥 Destinos más usados en planes generados
export const getTopDestinations = async (limit = 10) => {
  const result = await query(`
    SELECT
      location_suggestion  AS destination,
      COUNT(*)             AS times_used
    FROM plans
    WHERE location_suggestion IS NOT NULL
    GROUP BY location_suggestion
    ORDER BY times_used DESC
    LIMIT $1
  `, [limit]);

  return result.rows;
};

// 📊 Planes creados por día
export const getPlansOverTime = async (days = 30) => {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at)  AS date,
      COUNT(*)                       AS plans_created
    FROM plans
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);

  return result.rows;
};