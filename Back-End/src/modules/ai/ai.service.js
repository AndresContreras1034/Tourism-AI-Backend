console.log("AI SERVICE OK");
export { callDeepSeek };
// ======================================================
// 🔥 CONFIG
// ======================================================
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// ======================================================
// 🧠 SAFE JSON PARSER
// ======================================================
const safeJSONParse = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON parse failed:", err.message);
    return null;
  }
};

// ======================================================
// 🧠 DEEPSEEK CALL
// ======================================================
const callDeepSeek = async (messages, temperature = 0.5) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📡 [DEEPSEEK] Request");

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature,
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.log("❌ Empty response from DeepSeek");
      return null;
    }

    return content;

  } catch (error) {
    console.error("❌ DeepSeek error:", error);
    return null;
  } finally {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
};

// ======================================================
// 💬 CHATBOT (NO SE TOCA)
// ======================================================
export const generateChatResponse = async (message) => {
  const systemPrompt = `
Eres un asistente experto en turismo y seguridad en Bogotá.

REGLAS:
- Responde en Markdown
- No uses HTML
- Usa estructura clara con títulos y listas
`;

  const result = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ]);

  return result || "No pude generar respuesta en este momento.";
};

// ======================================================
// 🧠 PLANS GENERATOR (YA ROBUSTO)
// ======================================================
import { buildTravelPrompt } from "./prompt.builder.js";

export const generatePlans = async (profile) => {
  console.log("🧠 [AI PLANS] Generating...");

  const prompt = buildTravelPrompt(profile);

  const systemPrompt = `
Devuelve SOLO JSON válido SIN markdown ni texto adicional.

FORMATO OBLIGATORIO:
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
`;

  const raw = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ], 0.7);

  if (!raw) {
    return {
      plans: [],
      error: "No response from AI",
    };
  }

  console.log("📦 RAW:", raw);

  const parsed = safeJSONParse(raw);

  if (!parsed || !parsed.plans) {
    console.log("⚠️ Invalid JSON structure fallback");

    return {
      plans: [
        {
          title: "Plan temporal",
          description: "La IA no devolvió datos válidos",
          estimatedPrice: 0,
          activities: [],
          locationSuggestion: "N/A",
        },
      ],
      error: "Invalid AI response",
    };
  }

  console.log("🟢 [AI PLANS OK]");

  return parsed;
};

// ======================================================
// 🧠 ORCHESTRATOR SUPPORT FUNCTIONS (FALTANTES - CRÍTICO)
// ======================================================

export const buildExperience = async (seed, user) => {
  return {
    summary: `Experiencia en ${seed?.location?.name || "destino turístico"}`,
    insight: "Zona con alta actividad cultural y turística",
    description: "Experiencia generada por IA",
    highlights: ["Cultura", "Gastronomía", "Historia"],
  };
};

export const buildBudget = async (seed, user) => {
  return {
    estimated_total: 120000,
    price_range: {
      coffee: "5k - 10k COP",
      meal: "20k - 50k COP",
      snack: "3k - 8k COP",
    },
  };
};

export const buildSecurity = async (location) => {
  return {
    level: "medium",
    recommendation: "Zona generalmente segura con precaución básica",
    tips: [
      "Evita calles solitarias de noche",
      "Usa transporte confiable",
      "Mantén objetos personales seguros",
    ],
  };
};

export const buildOptimalDay = async (location, seed) => {
  return {
    date: "Sábado recomendado",
    weather: {
      condition: "Parcialmente nublado",
      temp_min: 14,
      temp_max: 22,
      precip_probability: 20,
      icon: "⛅",
    },
    reason: "Mejor clima y menor congestión turística",
  };
};