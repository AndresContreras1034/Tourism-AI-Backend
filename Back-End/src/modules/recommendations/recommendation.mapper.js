export const mapProfileToEngine = (profile) => {
  return {
    tipo_viaje: mapTravelType(profile.travelType),
    presupuesto: mapBudget(profile.budget),

    // 🔥 MUST MATCH PYTHON ENGINE
    companions: mapCompanions(profile.companions),

    climate: mapClimate(profile.climate),
    duration: mapDuration(profile.duration),

    // texto libre para scoring semántico
    interestsText: profile.interestsText || ""
  };
};

// =========================================================
// 🧠 TRAVEL TYPE → PYTHON ENGINE
// =========================================================
const mapTravelType = (type) => {
  const map = {
    adventure: "naturaleza",
    cultural: "cultural",
    gastronomy: "gastronomia",
    relax: "relax"
  };

  return map[type] || "cultural";
};

// =========================================================
// 💰 BUDGET NORMALIZATION → PYTHON
// =========================================================
const mapBudget = (budget) => {
  const map = {
    low: "bajo",
    medium: "medio",
    high: "alto"
  };

  return map[budget] || "medio";
};

// =========================================================
// 👥 COMPANIONS (CRÍTICO PARA MATCH PYTHON)
// =========================================================
const mapCompanions = (c) => {
  const map = {
    solo: "solo",
    couple: "pareja",
    friends: "amigos",
    family: "familia"
  };

  return map[c] || "solo";
};

// =========================================================
// 🌤️ CLIMATE NORMALIZATION
// =========================================================
const mapClimate = (c) => {
  const map = {
    hot: "calido",
    cold: "frio",
    neutral: "neutral",
    warm: "templado"
  };

  return map[c] || "neutral";
};

// =========================================================
// 📆 DURATION NORMALIZATION → PYTHON ENGINE
// =========================================================
const mapDuration = (d) => {
  const map = {
    weekend: "corto",
    short: "corto",
    medium: "medio",
    long: "largo"
  };

  return map[d] || "medio";
};