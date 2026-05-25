// db config
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

/* =========================================================
   🔥 ENV CHECK (solo en desarrollo)
========================================================= */
if (process.env.NODE_ENV !== "production") {
  console.log("📦 [ENV] DB CONFIG LOADED:");
  console.log("   DB_HOST:", process.env.DB_HOST);
  console.log("   DB_PORT:", process.env.DB_PORT);
  console.log("   DB_USER:", process.env.DB_USER);
  console.log("   DB_NAME:", process.env.DB_NAME);
}

/* =========================================================
   🔥 POOL DE CONEXIONES (AZURE SAFE)
========================================================= */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // 🔐 CRÍTICO EN AZURE POSTGRES
  ssl: {
    rejectUnauthorized: false,
  },

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/* =========================================================
   🧠 LOGS DE CONEXIÓN
========================================================= */
pool.on("connect", () => {
  console.log("🟢 [DB] Conexión establecida con PostgreSQL (Azure)");
});

pool.on("error", (err) => {
  console.error("🔴 [DB] Error inesperado en pool:", err);
});

/* =========================================================
   🧪 TEST DE CONEXIÓN (BOOT SAFE)
========================================================= */
const testBootConnection = async () => {
  try {
    console.log("🧪 [DB] Probando conexión inicial...");

    const res = await pool.query(
      "SELECT current_database() AS db, NOW() AS time"
    );

    console.log("🟢 [DB] Conectado correctamente:");
    console.log("   DB:", res.rows[0].db);
    console.log("   TIME:", res.rows[0].time);

  } catch (err) {
    console.error("🔴 [DB] Error en conexión inicial:");
    console.error(err.message);
  }
};

// SOLO en desarrollo (evita spam en producción)
if (process.env.NODE_ENV !== "production") {
  testBootConnection();
}

/* =========================================================
   🔥 QUERY WRAPPER (MODO PRODUCCIÓN + DEBUG)
========================================================= */
export const query = async (text, params = []) => {
  const start = Date.now();

  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("\n📡 [DB] QUERY");
      console.log(text);
      if (params.length) console.log("📦 Params:", params);
    }

    const result = await pool.query(text, params);

    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== "production") {
      console.log(`✅ [DB] OK (${duration}ms)`);
      console.log(`📊 Rows: ${result.rowCount}`);
    }

    return result;

  } catch (error) {
    console.error("❌ [DB] QUERY ERROR");
    console.error("SQL:", text);
    console.error("Params:", params);
    console.error("Message:", error.message);

    throw error;
  }
};

/* =========================================================
   🔥 EXPORTS
========================================================= */
export default pool;