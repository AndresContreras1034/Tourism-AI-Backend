// ======================================================
// ✈️ 1. PROMPT PARA PLANES DE VIAJE
// ======================================================

export const buildTravelPrompt = (profile) => {
  const { originCity, budget, travelType, climate, interests, companions, duration } = profile;
  const safeInterests = Array.isArray(interests) ? interests.join(", ") : "No especificado";

  return `Eres un experto en turismo y planificación de viajes en Colombia. Genera EXACTAMENTE 3 planes de viaje personalizados basados en este perfil:

Ciudad origen: ${originCity || "No especificado"} | Presupuesto: ${budget || "medio"} | Tipo: ${travelType || "general"} | Clima: ${climate || "indiferente"} | Intereses: ${safeInterests} | Compañía: ${companions || "no especificado"} | Duración: ${duration || "no especificado"}

Los 3 planes deben variar entre económico, medio y premium. Usa precios reales de Colombia con experiencias locales auténticas.

Responde SOLO con este JSON válido, sin markdown ni texto adicional:

{"plans":[{"title":"string","location":{"name":"string","coordinates":{"lat":0,"lng":0}},"score":0,"ai_context":{"summary":"string","local_insight":"string"},"transport":[{"key":"caminar|uber|bicicleta|bus","desc":"string"}],"map_points":[{"lat":0,"lng":0,"label":"string"}],"experience":{"description":"string","highlights":["string"]},"budget":{"estimated_total":0,"price_range":{"coffee":"string","meal":"string","snack":"string"}},"optimal_day":{"date":"string","weather":{"condition":"string","temp_min":0,"temp_max":0,"precip_probability":0,"icon":"string"},"reason":"string"},"security":{"level":"low|medium|high","recommendation":"string","tips":["string"]}}]}

Sustituye los valores de ejemplo. Usa valores realistas, nunca null.`.trim();
};

// ======================================================
// 💬 2. PROMPT PARA CHAT
// ======================================================

export const buildChatPrompt = (message) =>
  `Eres un asistente experto en turismo, seguridad urbana y precios en Bogotá, Colombia. Ayudas a turistas a detectar estafas, entender precios y obtener contexto cultural real. Responde de forma clara, directa y con tono calmado. No exageres peligros ni inventes leyes.

${message}`.trim();

// ======================================================
// 🔥 3. CHAT CON PERFIL
// ======================================================

export const buildChatWithProfilePrompt = (profile, message) => {
  const interests = Array.isArray(profile?.interests) ? profile.interests.join(", ") : "N/A";

  return `${buildChatPrompt(message)}

Perfil del usuario — Intereses: ${interests} | Tipo de viaje: ${profile?.travelType || "N/A"} | Presupuesto: ${profile?.budget || "N/A"}`.trim();
};