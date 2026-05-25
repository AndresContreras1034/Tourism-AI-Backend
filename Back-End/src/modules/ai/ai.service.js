console.log("AI SERVICE OK");

// ======================================================
// 🔥 CONFIG
// ======================================================
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

// ======================================================
// 🧠 HELPERS (ROBUSTO)
// ======================================================
const callDeepSeek = async (messages, temperature = 0.5) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📡 [DEEPSEEK] Request enviado");
    console.log("📨 Messages:", JSON.stringify(messages, null, 2));

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

    console.log("📥 [DEEPSEEK] Status:", response.status);

    const data = await response.json();

    console.log("📦 [DEEPSEEK RAW RESPONSE]:");
    console.log(JSON.stringify(data, null, 2));

    // 🚨 VALIDACIÓN REAL
    if (!data) {
      console.log("❌ No data from DeepSeek");
      return null;
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.log("❌ DeepSeek no devolvió content válido");
      return null;
    }

    console.log("🟢 [DEEPSEEK CONTENT OK]:");
    console.log(content);

    return content;

  } catch (error) {
    console.error("❌ [DEEPSEEK ERROR]", error);
    return null;
  } finally {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
};

// ======================================================
// 🧠 CHAT TURÍSTICO / SEGURIDAD
// ======================================================
export const generateChatResponse = async (message) => {
  console.log("💬 [AI CHAT] Procesando mensaje:", message);

const systemPrompt = `
Eres un asistente experto en turismo y seguridad en Bogotá.

🚨 REGLAS OBLIGATORIAS:
- Responde SOLO en MARKDOWN
- NO uses HTML (<p>, <ul>, <strong>)
- Usa:
  - # títulos
  - **negritas**
  - - listas
`;

  const result = await callDeepSeek([
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ]);

  console.log("🟢 [AI CHAT] Resultado final:", result);

  // 🔥 NUNCA DEVUELVAS UNDEFINED
  return result || "No pude generar respuesta en este momento.";
};

// ======================================================
// 🧠 GENERADOR DE PLANES
// ======================================================
import { buildTravelPrompt } from "./prompt.builder.js";

export const generatePlans = async (profile) => {
  console.log("🧠 [AI PLANS] Generando planes...");

  const prompt = buildTravelPrompt(profile);

  const raw = await callDeepSeek([
    {
      role: "system",
      content: "Devuelve SOLO JSON válido, sin texto adicional.",
    },
    {
      role: "user",
      content: prompt,
    },
  ], 0.7);

  console.log("📦 [AI PLANS RAW]:", raw);

  if (!raw) {
    return {
      plans: [],
      error: "No response from AI",
    };
  }

  try {
    const parsed = JSON.parse(raw);
    console.log("🟢 [AI PLANS PARSED OK]");
    return parsed;

  } catch (error) {
    console.error("❌ JSON parse error:", error.message);
    console.log("🔐 KEY FINAL:", process.env.DEEPSEEK_API_KEY);

    return {
      plans: [
        {
          title: "Error generando planes",
          description: "La IA no devolvió JSON válido",
          estimatedPrice: 0,
          activities: [],
          locationSuggestion: "N/A",
        },
      ],
    };
  }
};