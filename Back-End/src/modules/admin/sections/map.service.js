import { query } from "../../../config/db.js";

// 📍 Coordenadas fijas Bogotá
const BOGOTA_COORDS = {
  "cerro de monserrate":          { lat: 4.6053,  lng: -74.0558 },
  "jardín botánico":              { lat: 4.6483,  lng: -74.0970 },
  "senderismo en quebrada la vieja": { lat: 4.6761, lng: -74.0432 },
  "parque simón bolívar":         { lat: 4.6579,  lng: -74.0932 },
  "humedal santa maría del lago": { lat: 4.6732,  lng: -74.1094 },
  "tour gastronómico en zona g":  { lat: 4.6487,  lng: -74.0558 },
  "mercado de paloquemao":        { lat: 4.6210,  lng: -74.0900 },
  "cafés especiales en bogotá":   { lat: 4.6482,  lng: -74.0559 },
  "brunch en chapinero":          { lat: 4.6490,  lng: -74.0630 },
  "tour de postres bogotanos":    { lat: 4.6100,  lng: -74.0720 },
  "spa urbano en bogotá":         { lat: 4.6700,  lng: -74.0530 },
  "hotel boutique en chapinero":  { lat: 4.6510,  lng: -74.0620 },
  "tarde relajante en usaquén":   { lat: 4.6960,  lng: -74.0317 },
  "día de relajación en la sabana": { lat: 4.7200, lng: -74.0600 },
  "zona t nocturna":              { lat: 4.6660,  lng: -74.0528 },
  "bares en chapinero":           { lat: 4.6480,  lng: -74.0640 },
  "rooftops en bogotá":           { lat: 4.6620,  lng: -74.0510 },
  "andrés dc":                    { lat: 4.6760,  lng: -74.0480 },
  "museo del oro":                { lat: 4.6016,  lng: -74.0718 },
  "tour por la candelaria":       { lat: 4.5981,  lng: -74.0760 },
  "museo botero":                 { lat: 4.5973,  lng: -74.0747 },
  "teatro colón":                 { lat: 4.5974,  lng: -74.0757 },
  "compras en andino":            { lat: 4.6672,  lng: -74.0527 },
  "san victorino":                { lat: 4.6072,  lng: -74.0810 },
  "gran estación":                { lat: 4.6448,  lng: -74.1078 },
  "outlet en las américas":       { lat: 4.6340,  lng: -74.1320 },
};

export const getCoordsByLocation = (locationName) => {
  const key = locationName?.toLowerCase().trim();
  return BOGOTA_COORDS[key] || { lat: 4.7110, lng: -74.0721 }; // fallback centro Bogotá
};

// 📍 Usuarios por ciudad de origen
export const getUsersByCountry = async () => {
  const result = await query(`
    SELECT
      COALESCE(p.origin_city, 'Unknown') AS country,
      COUNT(DISTINCT u.id)               AS users
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    GROUP BY COALESCE(p.origin_city, 'Unknown')
    ORDER BY users DESC
  `);
  return result.rows;
};

// 🔥 Destinos más usados con coordenadas
export const getTopDestinations = async (limit = 10) => {
  const result = await query(`
    SELECT
      location_suggestion AS destination,
      COUNT(*)            AS times_used
    FROM plans
    WHERE location_suggestion IS NOT NULL
    GROUP BY location_suggestion
    ORDER BY times_used DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row) => ({
    ...row,
    ...getCoordsByLocation(row.destination),
  }));
};

// 📊 Planes creados por día
export const getPlansOverTime = async (days = 30) => {
  const result = await query(`
    SELECT
      DATE_TRUNC('day', created_at) AS date,
      COUNT(*)                      AS plans_created
    FROM plans
    WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date ASC
  `, [days]);
  return result.rows;
};