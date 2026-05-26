import dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  console.error("🔴 [ENV] Error cargando .env:", result.error.message);
  throw result.error;
}

console.log("🟢 [ENV] .env cargado correctamente");

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

const env = {
  PORT:         getEnv("PORT", false, 3000),
  NODE_ENV:     getEnv("NODE_ENV", false, "development"),

  // 🗄️ DATABASE
  DB_HOST:      getEnv("DB_HOST"),
  DB_PORT:      getEnv("DB_PORT", false, 5432),
  DB_USER:      getEnv("DB_USER"),
  DB_PASSWORD:  getEnv("DB_PASSWORD"),
  DB_NAME:      getEnv("DB_NAME"),
  DB_SSL:       getEnv("DB_SSL", false, "false"),

  // 🔐 JWT
  JWT_SECRET:    getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", false, "7d"),

  // ☁️ CLOUDINARY
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", false),
  CLOUDINARY_API_KEY:    getEnv("CLOUDINARY_API_KEY", false),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET", false),

  // 🌍 CORS
  CLIENT_URL: getEnv("CLIENT_URL", false, "http://localhost:5173"),

  // 🤖 AI
  DEEPSEEK_API_KEY: getEnv("DEEPSEEK_API_KEY"),
  AI_SERVICE_URL:   getEnv("AI_SERVICE_URL", false, "http://127.0.0.1:8000"),

  // 🗺️ ORS
  ORS_API_KEY: getEnv("ORS_API_KEY"),

  // 💳 STRIPE
  STRIPE_SECRET_KEY:     getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
};

console.log("\n📦 [ENV] Config cargada:");
console.log("--------------------------------");
Object.entries(env).forEach(([key, value]) => {
  const hidden = ["SECRET", "PASSWORD", "API_KEY", "API_SECRET"].some((k) =>
    key.includes(k)
  );
  console.log(`${key}: ${hidden ? "*****" : value}`);
});
console.log("--------------------------------\n");

export default env;