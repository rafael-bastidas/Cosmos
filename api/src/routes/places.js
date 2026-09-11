const express = require("express");

const router = express.Router();

function computeUtcOffsetHours(timezone, dateStr, timeStr) {
  if (!timezone) return null;
  try {
    const [y, m, d] = (dateStr || new Date().toISOString().slice(0, 10)).split("-").map(Number);
    const [hh, mm] = (timeStr || "12:00").split(":").map(Number);
    const instant = new Date(Date.UTC(y, m - 1, d, hh, mm));
    const dtf = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" });
    const part = dtf.formatToParts(instant).find(p => p.type === "timeZoneName");
    if (!part) return null;
    if (part.value === "GMT") return 0;
    const match = part.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!match) return null;
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (parseInt(match[2], 10) + parseInt(match[3], 10) / 60);
  } catch (err) {
    return null;
  }
}

/**
 * GET /api/places/search?q=...&date=YYYY-MM-DD&time=HH:MM
 *
 * Consulta la API de geocodificaci?n de Open-Meteo y devuelve una lista de coincidencias
 * con sus coordenadas decimales, zona horaria y desfase UTC calculado.
 */
router.get("/search", async (req, res) => {
  const query = (req.query.q || "").trim();
  const dateStr = (req.query.date || "").trim();
  const timeStr = (req.query.time || "").trim();

  if (!query) {
    return res.json({ results: [] });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=es&format=json`;
    const response = await fetch(geoUrl, {
      headers: { "Accept": "application/json", "User-Agent": "Cosmos-API/1.0" }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error al consultar el servicio de geocodificaci?n." });
    }

    const data = await response.json();
    const rawResults = data.results || [];

    const results = rawResults.map((r) => {
      const parts = [r.name, r.admin1, r.country].filter(Boolean);
      const displayName = parts.join(", ");
      const cityCountry = [r.name, r.country].filter(Boolean).join(", ");
      const utcOffset = computeUtcOffsetHours(r.timezone, dateStr, timeStr);

      return {
        id: r.id,
        name: r.name,
        admin1: r.admin1 || null,
        country: r.country || null,
        country_code: r.country_code || null,
        display_name: displayName,
        city_country: cityCountry,
        latitude: Number(r.latitude.toFixed(4)),
        longitude: Number(r.longitude.toFixed(4)),
        timezone: r.timezone || null,
        utc_offset: utcOffset
      };
    });

    res.json({ results });
  } catch (err) {
    console.error("Error en /api/places/search:", err);
    res.status(500).json({ error: "No se pudo completar la b?squeda de lugares." });
  }
});

module.exports = router;
