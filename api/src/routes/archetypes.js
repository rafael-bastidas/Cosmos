const express = require("express");
const { getWesternSignByDate } = require("../lib/zodiac");
const { getChineseHoroscope } = require("../lib/chinese");
const { computeBirthChart, buildChartInterpretation, getChartQualities } = require("../lib/birthChart");
const { scoreEnneagram, buildEnneagramInterpretation, ENNEAGRAM_TYPES, ENNEAGRAM_CENTERS, ENNEAGRAM_QUESTIONS } = require("../lib/enneagram");

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function parseDate(dateStr) {
  if (!DATE_RE.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return { year, month, day };
}

function parseTime(timeStr) {
  if (!TIME_RE.test(timeStr)) return null;
  const [hour, minute] = timeStr.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function inRange(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

/**
 * GET /api/archetypes/questions
 *
 * Describe qué datos hay que recolectar (y cómo enviarlos en el POST) para calcular
 * los 4 arquetipos: signo zodiacal, horóscopo chino, carta astral y eneatipo.
 */
router.get("/questions", (req, res) => {
  res.json({
    description: "Datos necesarios para calcular los arquetipos. Envíalos con esta misma forma a POST /api/archetypes/calculate. Todo es opcional: solo se calculan los arquetipos para los que haya datos suficientes.",
    birthInfo: {
      date: { field: "date", type: "string", format: "YYYY-MM-DD", required: false,
        description: "Fecha de nacimiento. Necesaria para el signo zodiacal, el horóscopo chino y la carta astral." },
      time: { field: "time", type: "string", format: "HH:MM (24h)", required: false,
        description: "Hora de nacimiento. Necesaria, junto con utcOffset/latitude/longitude, solo para la carta astral." },
      utcOffset: { field: "utcOffset", type: "number", example: -5, required: false,
        description: "Desfase horario respecto a UTC vigente en el momento y lugar de nacimiento (considerando horario de verano si aplicaba). Necesario para la carta astral." },
      latitude: { field: "latitude", type: "number", range: [-90, 90], example: 4.71, required: false,
        description: "Latitud del lugar de nacimiento en grados decimales (Norte positivo). Necesaria para la carta astral." },
      longitude: { field: "longitude", type: "number", range: [-180, 180], example: -74.07, required: false,
        description: "Longitud del lugar de nacimiento en grados decimales (Este positivo). Necesaria para la carta astral." },
      place: { field: "place", type: "string", required: false,
        description: "Nombre del lugar de nacimiento. Solo informativo, no se usa en el cálculo." }
    },
    enneagram: {
      instructions: "Para calcular el eneatipo, responde cada afirmación con un entero de 1 (muy en desacuerdo) a 5 (muy de acuerdo) y envíalas como POST en el campo `answers`, un objeto { [id]: valor } usando el id de cada pregunta como llave. Las preguntas no respondidas se toman como neutras (3).",
      totalQuestions: ENNEAGRAM_QUESTIONS.length,
      questions: ENNEAGRAM_QUESTIONS.map(q => ({ id: q.id, text: q.text }))
    }
  });
});

/**
 * POST /api/archetypes/calculate
 *
 * Body (todos los campos son opcionales; se calcula cada arquetipo si hay datos suficientes):
 * {
 *   "date": "1990-06-15",
 *   "time": "08:30",
 *   "utcOffset": -5,
 *   "latitude": 4.71,
 *   "longitude": -74.07,
 *   "place": "Bogotá, Colombia",
 *   "answers": { "ennea_1_0": 4, "ennea_1_1": 2, ... }
 * }
 */
router.post("/calculate", (req, res) => {
  const body = req.body || {};
  const notes = [];
  const result = { zodiac: null, chinese: null, birthChart: null, enneagram: null, notes };

  let dateParts = null;
  if (body.date !== undefined) {
    dateParts = parseDate(body.date);
    if (!dateParts) return res.status(400).json({ error: "El campo 'date' debe tener formato YYYY-MM-DD y ser una fecha válida." });
  }

  if (dateParts) {
    const sign = getWesternSignByDate(dateParts.month, dateParts.day);
    result.zodiac = {
      name: sign.name, planet: sign.planet, element: sign.element, modality: sign.modality,
      qualities: sign.qualities, description: sign.desc
    };
    const { animal, element } = getChineseHoroscope(dateParts.year);
    result.chinese = {
      animal: animal.name, element: element.name, year: dateParts.year,
      qualities: [...animal.qualities, ...element.qualities],
      description: `${animal.desc} El elemento ${element.name} ${element.desc}`
    };
  } else {
    notes.push("zodiac/chinese: se omitieron porque falta 'date'.");
  }

  const hasTime = body.time !== undefined;
  const hasUtcOffset = body.utcOffset !== undefined;
  const hasLatitude = body.latitude !== undefined;
  const hasLongitude = body.longitude !== undefined;
  const wantsChart = hasTime || hasUtcOffset || hasLatitude || hasLongitude;

  if (wantsChart) {
    if (!dateParts) {
      notes.push("birthChart: se omitió porque falta 'date'.");
    } else {
      const timeParts = hasTime ? parseTime(body.time) : null;
      if (hasTime && !timeParts) return res.status(400).json({ error: "El campo 'time' debe tener formato HH:MM (24h)." });

      const utcOffset = Number(body.utcOffset);
      const latitude = Number(body.latitude);
      const longitude = Number(body.longitude);

      const missing = [];
      if (!timeParts) missing.push("time");
      if (!hasUtcOffset || !inRange(utcOffset, -12, 14)) missing.push("utcOffset (-12 a 14)");
      if (!hasLatitude || !inRange(latitude, -90, 90)) missing.push("latitude (-90 a 90)");
      if (!hasLongitude || !inRange(longitude, -180, 180)) missing.push("longitude (-180 a 180)");

      if (missing.length > 0) {
        notes.push(`birthChart: se omitió; faltan o son inválidos: ${missing.join(", ")}.`);
      } else {
        const chart = computeBirthChart({
          year: dateParts.year, month: dateParts.month, day: dateParts.day,
          hour: timeParts.hour, minute: timeParts.minute,
          utcOffset, latitude, longitude
        });
        result.birthChart = {
          sunSign: chart.sunSign.name, sunHouse: chart.sunHouse,
          moonSign: chart.moonSign.name, moonHouse: chart.moonHouse,
          ascendantSign: chart.ascSign.name,
          houseSystem: "Signos Enteros (Whole Sign)",
          qualities: getChartQualities(chart),
          description: buildChartInterpretation(chart)
        };
      }
    }
  }

  if (body.answers && typeof body.answers === "object" && Object.keys(body.answers).length > 0) {
    const scored = scoreEnneagram(body.answers);
    const main = ENNEAGRAM_TYPES[scored.mainId];
    const center = ENNEAGRAM_CENTERS[main.center];
    result.enneagram = {
      mainType: scored.mainId, mainTypeName: main.name,
      wing: `${scored.mainId}w${scored.wingId}`, wingType: scored.wingId, wingTypeName: ENNEAGRAM_TYPES[scored.wingId].name,
      center: center.label,
      integration: { type: scored.integrationId, name: ENNEAGRAM_TYPES[scored.integrationId].name },
      disintegration: { type: scored.disintegrationId, name: ENNEAGRAM_TYPES[scored.disintegrationId].name },
      qualities: main.qualities,
      description: buildEnneagramInterpretation(scored),
      scores: scored.scores,
      answeredQuestions: scored.answeredCount,
      totalQuestions: scored.totalQuestions
    };
    if (scored.answeredCount < scored.totalQuestions) {
      notes.push(`enneagram: se calculó con ${scored.answeredCount}/${scored.totalQuestions} respuestas; las faltantes se trataron como neutras (3).`);
    }
  } else {
    notes.push("enneagram: se omitió porque falta 'answers'.");
  }

  res.json(result);
});

module.exports = router;
