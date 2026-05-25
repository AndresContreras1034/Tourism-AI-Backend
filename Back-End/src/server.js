import dotenv from "dotenv";
dotenv.config(); // 🔥 SIEMPRE PRIMERO

import app from "./app.js";
import env from "./config/env.js";

import { logInfo, logSuccess, logError } from "./utils/logger.js";

console.log("\n🚀 [SERVER] Inicializando servidor...");
console.log("📦 [SERVER] NODE_ENV:", env.NODE_ENV);
console.log("📦 [SERVER] PORT:", env.PORT);

const PORT = Number(env.PORT || 3000);

/* =========================================================
   🚀 START SERVER
========================================================= */
const startServer = () => {
  try {
    logInfo("SERVER", "Iniciando backend...");

    const server = app.listen(PORT, () => {
      console.log("\n--------------------------------");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log("--------------------------------\n");

      logSuccess("SERVER", `API lista en http://localhost:${PORT}`);
    });

    /* =========================================================
       🧠 MANEJO DE ERRORES GLOBALES DEL SERVER
    ========================================================= */
    server.on("error", (error) => {
      logError("SERVER", "Error en servidor HTTP", error);

      if (error.code === "EADDRINUSE") {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
      }

      process.exit(1);
    });

    /* =========================================================
       🔴 SHUTDOWN LIMPIO (AZURE / PROD)
    ========================================================= */
    process.on("SIGINT", () => {
      console.log("\n🛑 Cerrando servidor (SIGINT)...");
      server.close(() => {
        logInfo("SERVER", "Servidor cerrado correctamente");
        process.exit(0);
      });
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Cerrando servidor (SIGTERM)...");
      server.close(() => {
        logInfo("SERVER", "Servidor cerrado correctamente");
        process.exit(0);
      });
    });

  } catch (error) {
    logError("SERVER", "Error crítico al iniciar servidor", error);
    console.error("❌ [SERVER FATAL ERROR]:", error.message);
    process.exit(1);
  }
};

/* =========================================================
   🚀 BOOT
========================================================= */
startServer();