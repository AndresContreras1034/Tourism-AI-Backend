// validate middleware
export const validateMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      console.log("🧪 [VALIDATION] Iniciando validación...");
      console.log("➡️ URL:", req.originalUrl);
      console.log("📦 Body recibido:", req.body);

      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // muestra todos los errores
        stripUnknown: true, // elimina campos no permitidos
      });

      if (error) {
        console.warn("⚠️ [VALIDATION] Error de validación detectado");

        const errors = error.details.map((err) => err.message);

        console.warn("📛 Errores:", errors);

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      // 🔥 reemplazamos body limpio
      req.body = value;

      console.log("🟢 [VALIDATION] Datos válidos");

      next();
    } catch (err) {
      console.error("❌ [VALIDATION] Error interno:", err.message);

      return res.status(500).json({
        success: false,
        message: "Validation middleware error",
      });
    }
  };
};