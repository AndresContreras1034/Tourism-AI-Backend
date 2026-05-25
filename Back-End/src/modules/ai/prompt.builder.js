console.log("🧠 [PROMPT BUILDER] Inicializado");

// ======================================================
// ✈️ 1. PROMPT PARA PLANES DE VIAJE
// ======================================================

export const buildTravelPrompt = (profile) => {
  console.log("🧠 [PROMPT] Generando prompt de viajes...");

  const {
    originCity,
    budget,
    travelType,
    climate,
    interests,
    companions,
    duration,
  } = profile;

  const safeInterests = Array.isArray(interests)
    ? interests.join(", ")
    : "No especificado";

  return `
Eres un experto en turismo y planificación de viajes.

Tu tarea es generar 3 planes de viaje personalizados.

📍 CONTEXTO DEL USUARIO
- Ciudad de origen: ${originCity || "No especificado"}
- Presupuesto: ${budget || "medio"}
- Tipo de viaje: ${travelType || "general"}
- Clima preferido: ${climate || "indiferente"}
- Intereses: ${safeInterests}
- Compañía: ${companions || "no especificado"}
- Duración del viaje: ${duration || "no especificado"}

🎯 OBJETIVO
- Planes realistas según presupuesto
- Experiencias locales auténticas
- Variación entre planes

📦 RESPUESTA OBLIGATORIA (SOLO JSON)
{
  "plans": [
    {
      "title": "string",
      "description": "string",
      "estimatedPrice": number,
      "activities": ["string"],
      "locationSuggestion": "string"
    }
  ]
}

🚫 REGLAS
- Solo JSON
- Máximo 3 planes
- Sin texto extra
`;
};

// ======================================================
// 💬 2. PROMPT PARA CHAT (ESTAFAS / SEGURIDAD BOGOTÁ)
// ======================================================

export const buildChatPrompt = (message) => {
  console.log("💬 [PROMPT] Generando prompt de chat...");

  return `
Eres un asistente experto en turismo, seguridad urbana y estafas en Bogotá, Colombia.

Tu función es ayudar a extranjeros con situaciones reales.

📍 CONTEXTO:
- Ciudad: Bogotá
- Tipo de usuario: turista / extranjero

🎯 TU TRABAJO:
- Detectar estafas o cobros abusivos
- Explicar precios normales vs exagerados
- Dar contexto cultural local
- Dar consejos claros y accionables
- Mantener tono calmado y directo

🧠 IMPORTANTE:
- No exageres peligros
- No inventes leyes
- Sé honesto con precios y contexto real

💬 MENSAJE DEL USUARIO:
${message}

RESPONDE DE FORMA CLARA Y DIRECTA.
`;
};

// ======================================================
// 🔥 OPCIONAL (SI QUIERES UN CHAT CON PERFIL)
// ======================================================

export const buildChatWithProfilePrompt = (profile, message) => {
  console.log("💬 [PROMPT] Chat con perfil generado...");

  return `
${buildChatPrompt(message)}

📊 INFO ADICIONAL DEL USUARIO:
- Intereses: ${Array.isArray(profile?.interests) ? profile.interests.join(", ") : "N/A"}
- Tipo de viaje: ${profile?.travelType || "N/A"}
- Presupuesto: ${profile?.budget || "N/A"}
`;
};