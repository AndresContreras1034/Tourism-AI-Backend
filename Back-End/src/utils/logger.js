// logger utils
console.log("📊 [LOGGER UTILS] Inicializado");

// =========================
// ℹ️ INFO LOG
// =========================
export const logInfo = (module, message, data = null) => {
  console.log(`ℹ️ [${module}] ${message}`);
  if (data) console.log("📦 DATA:", data);
};

// =========================
// ⚠️ WARN LOG
// =========================
export const logWarn = (module, message, data = null) => {
  console.warn(`⚠️ [${module}] ${message}`);
  if (data) console.warn("📦 DATA:", data);
};

// =========================
// ❌ ERROR LOG
// =========================
export const logError = (module, message, error = null) => {
  console.error(`❌ [${module}] ${message}`);

  if (error) {
    console.error("🔥 ERROR DETAILS:", error.message || error);
  }
};

// =========================
// 🚀 SUCCESS LOG
// =========================
export const logSuccess = (module, message, data = null) => {
  console.log(`🟢 [${module}] ${message}`);
  if (data) console.log("📦 DATA:", data);
};

// =========================
// 🤖 AI LOG (especial para tu sistema)
// =========================
export const logAI = (message, data = null) => {
  console.log(`🤖 [AI] ${message}`);
  if (data) console.log("🧠 CONTEXT:", data);
};