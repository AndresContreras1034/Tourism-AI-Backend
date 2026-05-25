import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/* =========================================================
   🔥 ENV DEBUG
========================================================= */
if (process.env.NODE_ENV !== "production") {
  console.log("📦 [ENV] DB CONFIG LOADED:");
  console.log("   DB_HOST:", process.env.DB_HOST);
  console.log("   DB_PORT:", process.env.DB_PORT);
  console.log("   DB_USER:", process.env.DB_USER);
  console.log("   DB_NAME:", process.env.DB_NAME);
}

/* =========================================================
   🔥 POOL (AZURE SAFE)
========================================================= */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/* =========================================================
   🧠 CONNECTION DEBUG (CRÍTICO PARA TU BUG)
========================================================= */
pool.on("connect", async (client) => {
  console.log("\n🟢 [DB] Connected to PostgreSQL (Azure)");

  try {
    const res = await client.query(`
      SELECT 
        current_database() AS db,
        current_user AS user,
        inet_server_addr() AS server_ip,
        inet_server_port() AS port
    `);

    console.log("🔥 [DB REAL CONTEXT]");
    console.table(res.rows[0]);
  } catch (err) {
    console.error("⚠️ [DB CONTEXT ERROR]", err.message);
  }
});

pool.on("error", (err) => {
  console.error("🔴 [DB POOL ERROR]:", err);
});

/* =========================================================
   🧪 BOOT TEST
========================================================= */
const testBootConnection = async () => {
  try {
    console.log("🧪 [DB] Testing connection...");

    const res = await pool.query(`
      SELECT current_database() AS db, NOW() AS time
    `);

    console.log("🟢 [DB OK]");
    console.table(res.rows[0]);
  } catch (err) {
    console.error("🔴 [DB BOOT ERROR]");
    console.error(err.message);
  }
};

if (process.env.NODE_ENV !== "production") {
  testBootConnection();
}

/* =========================================================
   🔥 QUERY WRAPPER (DEBUG LIMPIO + EFECTIVO)
========================================================= */
export const query = async (text, params = []) => {
  const start = Date.now();

  try {
    console.log("\n📡 ================= DB QUERY =================");
    console.log("SQL:", text);
    console.log("PARAMS:", params);

    const result = await pool.query(text, params);

    const duration = Date.now() - start;

    console.log("✅ SUCCESS");
    console.log(`⏱️ ${duration}ms`);
    console.log(`📊 ROWS: ${result.rowCount}`);

    // 🔥 SOLO PARA USERS (tu caso crítico)
    if (text.toLowerCase().includes("from users")) {
      console.log("👤 USERS RESULT:");
      console.table(result.rows);
    }

    return result;
  } catch (error) {
    console.error("\n❌ ================= DB ERROR =================");
    console.error("SQL:", text);
    console.error("PARAMS:", params);
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);

    // 🔥 IMPORTANTE: detectar mismatch de schema
    if (error.code === "42703") {
      console.error("🚨 COLUMN ERROR DETECTED (schema mismatch)");
      console.error("👉 Esto casi siempre significa: otra base o tabla distinta");
    }

    throw error;
  }
};

/* =========================================================
   🔥 EXPORT
========================================================= */
export default pool;