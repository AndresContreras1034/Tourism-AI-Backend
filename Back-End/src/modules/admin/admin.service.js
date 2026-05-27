import { query } from "../../config/db.js";

// ======================================================
// 👥 USUARIOS — resumen general
// ======================================================
export const getUsersSummary = async () => {
  const result = await query(`
    SELECT
      COUNT(*)                                                        AS total_users,
      COUNT(CASE WHEN role = 'superadmin' THEN 1 END)                AS admins,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) AS new_last_7_days,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_last_30_days
    FROM users
  `);

  return result.rows[0];
};

// ======================================================
// 📋 LISTA DE USUARIOS (paginada)
// ======================================================
export const getUsersList = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const data = await query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.tokens,
      u.created_at,
      COUNT(p.id)  AS total_plans,
      COUNT(o.id)  AS total_orders,
      COALESCE(SUM(o.amount), 0) AS total_spent
    FROM users u
    LEFT JOIN plans  p ON p.user_id = u.id
    LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'succeeded'
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const total = await query(`SELECT COUNT(*) AS count FROM users`);

  return {
    users:      data.rows,
    total:      Number(total.rows[0].count),
    page,
    total_pages: Math.ceil(Number(total.rows[0].count) / limit),
  };
};

// ======================================================
// 🔍 DETALLE DE UN USUARIO
// ======================================================
export const getUserDetail = async (userId) => {
  const user = await query(`
    SELECT id, name, email, role, tokens, mfa_enabled, created_at
    FROM users
    WHERE id = $1
  `, [userId]);

  if (!user.rows[0]) throw new Error("Usuario no encontrado");

  const plans = await query(`
    SELECT id, title, location_suggestion, source, created_at
    FROM plans
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 10
  `, [userId]);

  const orders = await query(`
    SELECT id, stripe_id, plan_key, plan_name, amount, currency, status, created_at
    FROM orders
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [userId]);

  return {
    user:   user.rows[0],
    plans:  plans.rows,
    orders: orders.rows,
  };
};

// ======================================================
// 🔑 CAMBIAR ROL DE USUARIO
// ======================================================
export const updateUserRole = async (userId, role) => {
  const validRoles = ["user", "superadmin"];

  if (!validRoles.includes(role)) {
    throw new Error(`Rol inválido: ${role}. Válidos: ${validRoles.join(", ")}`);
  }

  const result = await query(`
    UPDATE users
    SET role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, name, email, role
  `, [role, userId]);

  if (!result.rows[0]) throw new Error("Usuario no encontrado");

  return result.rows[0];
};

// ======================================================
// 📊 OVERVIEW GLOBAL (para el home del dashboard)
// ======================================================
export const getGlobalOverview = async () => {
  const [users, orders, plans] = await Promise.all([
    query(`SELECT COUNT(*) AS total FROM users`),
    query(`
      SELECT
        COUNT(*)                                              AS total_orders,
        COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount END), 0) AS total_revenue,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)        AS failed_orders
      FROM orders
    `),
    query(`
      SELECT
        COUNT(*)                                              AS total_plans,
        COUNT(CASE WHEN source = 'ai' THEN 1 END)            AS ai_plans
      FROM plans
    `),
  ]);

  return {
    total_users:    Number(users.rows[0].total),
    total_orders:   Number(orders.rows[0].total_orders),
    total_revenue:  Number(orders.rows[0].total_revenue),
    failed_orders:  Number(orders.rows[0].failed_orders),
    total_plans:    Number(plans.rows[0].total_plans),
    ai_plans:       Number(plans.rows[0].ai_plans),
  };
};