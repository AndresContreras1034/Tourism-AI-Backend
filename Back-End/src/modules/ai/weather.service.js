// modules/ai/weather.service.js

const BOGOTA_LAT = 4.7110;
const BOGOTA_LNG = -74.0721;

const WMO_CODES = {
  0:  { condition: "Despejado",               icon: "☀️" },
  1:  { condition: "Mayormente despejado",     icon: "🌤️" },
  2:  { condition: "Parcialmente nublado",     icon: "⛅" },
  3:  { condition: "Nublado",                  icon: "☁️" },
  45: { condition: "Niebla",                   icon: "🌫️" },
  48: { condition: "Niebla con escarcha",      icon: "🌫️" },
  51: { condition: "Llovizna ligera",          icon: "🌦️" },
  53: { condition: "Llovizna moderada",        icon: "🌦️" },
  55: { condition: "Llovizna intensa",         icon: "🌧️" },
  61: { condition: "Lluvia ligera",            icon: "🌧️" },
  63: { condition: "Lluvia moderada",          icon: "🌧️" },
  65: { condition: "Lluvia intensa",           icon: "🌧️" },
  80: { condition: "Chubascos ligeros",        icon: "🌦️" },
  81: { condition: "Chubascos moderados",      icon: "🌧️" },
  82: { condition: "Chubascos violentos",      icon: "⛈️" },
  95: { condition: "Tormenta eléctrica",       icon: "⛈️" },
  99: { condition: "Tormenta con granizo",     icon: "⛈️" },
};

// ======================================================
// 🌤️ OBTENER PRONÓSTICO 7 DÍAS — BOGOTÁ
// ======================================================
export const getWeekForecast = async () => {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude",                    BOGOTA_LAT);
    url.searchParams.set("longitude",                   BOGOTA_LNG);
    url.searchParams.set("daily",                       [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
    ].join(","));
    url.searchParams.set("timezone",                    "America/Bogota");
    url.searchParams.set("forecast_days",               "7");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Open-Meteo error: ${response.status}`);
    }

    const data = await response.json();
    const { daily } = data;

    // Construir array de días
    const days = daily.time.map((date, i) => ({
      date,
      weathercode:   daily.weathercode[i],
      temp_max:      daily.temperature_2m_max[i],
      temp_min:      daily.temperature_2m_min[i],
      precip:        daily.precipitation_probability_max[i],
    }));

    return days;

  } catch (error) {
    console.error("❌ [WEATHER] Error fetching forecast:", error.message);
    return null;
  }
};

// ======================================================
// 🏆 CALCULAR DÍA ÓPTIMO
// Score: menor lluvia tiene más peso, temperatura agradable (14–20°C) suma puntos
// ======================================================
export const getOptimalDay = async () => {
  const days = await getWeekForecast();

  if (!days) {
    return {
      date:    "No disponible",
      weather: {
        condition:          "No disponible",
        temp_min:           0,
        temp_max:           0,
        precip_probability: 0,
        icon:               "❓",
      },
      reason: "No se pudo obtener el pronóstico del clima.",
    };
  }

  // Scoring: penaliza lluvia, premia temperatura agradable
  const scored = days.map((day) => {
    const rainPenalty  = day.precip;                                      // 0–100
    const tempBonus    = day.temp_max >= 14 && day.temp_max <= 22 ? 20 : 0;
    const score        = 100 - rainPenalty + tempBonus;

    return { ...day, score };
  });

  const best = scored.reduce((a, b) => (a.score > b.score ? a : b));

  const wmo     = WMO_CODES[best.weathercode] || { condition: "Variable", icon: "🌡️" };

  // Razón dinámica basada en datos reales
  let reason = "";
  if (best.precip <= 20) {
    reason = "Día con mínima probabilidad de lluvia, ideal para recorrer la ciudad.";
  } else if (best.precip <= 40) {
    reason = "Clima aceptable con lluvia moderada, lleva paraguas por si acaso.";
  } else {
    reason = "Es el mejor día disponible, aunque se esperan lluvias. Planifica actividades bajo techo.";
  }

  return {
    date:    best.date,
    weather: {
      condition:          wmo.condition,
      temp_min:           best.temp_min,
      temp_max:           best.temp_max,
      precip_probability: best.precip,
      icon:               wmo.icon,
    },
    reason,
  };
};