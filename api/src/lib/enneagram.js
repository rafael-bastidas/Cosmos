const {
  ENNEAGRAM_TYPES,
  ENNEAGRAM_CENTERS,
  ENNEAGRAM_WINGS,
  ENNEAGRAM_INTEGRATION,
  ENNEAGRAM_DISINTEGRATION,
  ENNEAGRAM_QUESTIONS
} = require("../data/enneagram");

/**
 * @param {Object} answers - mapa { [questionId]: valor 1-5 }. Las preguntas sin responder
 *   se toman como neutras (3) para poder calcular con respuestas parciales.
 */
function scoreEnneagram(answers) {
  const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const answeredIds = [];

  ENNEAGRAM_QUESTIONS.forEach(q => {
    const raw = answers ? answers[q.id] : undefined;
    const value = Number.isFinite(Number(raw)) ? Math.min(5, Math.max(1, Number(raw))) : 3;
    if (raw !== undefined) answeredIds.push(q.id);
    scores[q.type] += value;
  });

  let mainId = 1;
  for (let t = 2; t <= 9; t++) {
    if (scores[t] > scores[mainId]) mainId = t;
  }

  const [wingA, wingB] = ENNEAGRAM_WINGS[mainId];
  const wingId = scores[wingA] >= scores[wingB] ? wingA : wingB;
  const integrationId = ENNEAGRAM_INTEGRATION[mainId];
  const disintegrationId = ENNEAGRAM_DISINTEGRATION[mainId];

  return { scores, mainId, wingId, integrationId, disintegrationId, answeredCount: answeredIds.length, totalQuestions: ENNEAGRAM_QUESTIONS.length };
}

function buildEnneagramInterpretation({ mainId, wingId, integrationId, disintegrationId }) {
  const main = ENNEAGRAM_TYPES[mainId];
  const wing = ENNEAGRAM_TYPES[wingId];
  const integration = ENNEAGRAM_TYPES[integrationId];
  const disintegration = ENNEAGRAM_TYPES[disintegrationId];
  const center = ENNEAGRAM_CENTERS[main.center];

  return `${main.desc}

Miedo básico: ${main.fear} Deseo básico: ${main.desire}

Tu ala dominante (Tipo ${wingId} – ${wing.name}) matiza tu personalidad, aportando rasgos como ${wing.qualities.slice(0, 3).join(", ").toLowerCase()}.

Perteneces al centro ${center.label}: ${center.desc}

En momentos de seguridad y crecimiento personal, tiendes a integrar cualidades del Tipo ${integrationId} (${integration.name}), como ${integration.qualities.slice(0, 3).join(", ").toLowerCase()}. Bajo estrés, en cambio, puedes desplazarte hacia patrones del Tipo ${disintegrationId} (${disintegration.name}), como ${disintegration.qualities.slice(0, 3).join(", ").toLowerCase()}.`;
}

module.exports = { scoreEnneagram, buildEnneagramInterpretation, ENNEAGRAM_TYPES, ENNEAGRAM_CENTERS, ENNEAGRAM_QUESTIONS };
