import env from "../../config/env.js";

const ORS_BASE = "https://api.openrouteservice.org/v2/directions/foot-walking/geojson";

// ======================================================
// 🗺️ ORS — Genera ruta entre puntos
// Recibe: [{ lat, lng }, { lat, lng }, ...]
// Devuelve: [{ lat, lng }, ...] — coordenadas de la polilínea
// ======================================================
export const getRoute = async (points) => {
  try {
    if (!points || points.length < 2) {
      console.warn("⚠️ [ORS] Se necesitan al menos 2 puntos para generar ruta");
      return [];
    }

    // ORS espera [lng, lat] (GeoJSON order)
    const coordinates = points.map((p) => [p.lng, p.lat]);

    console.log("🗺️ [ORS] Generando ruta entre", coordinates.length, "puntos...");

    const res = await fetch(ORS_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.ORS_API_KEY,
      },
      body: JSON.stringify({ coordinates }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("❌ [ORS] Error response:", err);
      return [];
    }

    const data = await res.json();

    // GeoJSON devuelve coordenadas como [lng, lat] — invertir a { lat, lng }
    const routeCoords = data.features?.[0]?.geometry?.coordinates || [];

    const polyline = routeCoords.map(([lng, lat]) => ({ lat, lng }));

    console.log("✅ [ORS] Ruta generada con", polyline.length, "puntos");

    return polyline;

  } catch (error) {
    console.error("❌ [ORS] Error generando ruta:", error.message);
    return [];
  }
};