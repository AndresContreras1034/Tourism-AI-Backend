// config/env.js

import dotenv from "dotenv";

// =========================
// 🔥 CARGA SEGURA DE .env
// =========================
const result = dotenv.config();

if (result.error) {
  console.error("🔴 [ENV] Error cargando .env:", result.error.message);
  throw result.error;
}

console.log("🟢 [ENV] .env cargado correctamente");

// =========================
// 🔥 helper para leer variables con validación
// =========================
const getEnv = (key, required = true, defaultValue = undefined) => {
  const value = process.env[key];

  if (value === undefined || value === "") {
    if (required && defaultValue === undefined) {
      console.error(`🔴 [ENV] Variable faltante: ${key}`);
      throw new Error(`Missing environment variable: ${key}`);
    }

    console.warn(`🟡 [ENV] Usando valor por defecto para: ${key}`);
    return defaultValue;
  }

  console.log(`🟢 [ENV] ${key} cargada correctamente`);
  return value;
};

// =========================
// 🔥 CONFIG CENTRALIZADA
// =========================
const env = {
  PORT: getEnv("PORT", false, 3000),

  DB_HOST: getEnv("DB_HOST"),
  DB_PORT: getEnv("DB_PORT", false, 5432),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  DB_NAME: getEnv("DB_NAME"),

  JWT_SECRET: getEnv("JWT_SECRET"), // 🔥 CRÍTICO
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", false, "7d"),

  NODE_ENV: getEnv("NODE_ENV", false, "development"),
};

// =========================
// 🔥 DEBUG FINAL (MUY IMPORTANTE)
// =========================
console.log("\n📦 [ENV] Config cargada:");
console.log("--------------------------------");
Object.entries(env).forEach(([key, value]) => {
  if (key.includes("SECRET") || key.includes("PASSWORD")) {
    console.log(`${key}: ***** (hidden)`);
  } else {
    console.log(`${key}: ${value}`);
  }
});
console.log("--------------------------------\n");

// =========================
// EXPORT
// =========================
export default env;