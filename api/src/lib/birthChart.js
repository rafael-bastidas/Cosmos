const { getSignByLongitude, normalizeDegrees, SIGNS_BY_LONGITUDE } = require("./zodiac");

const HOUSE_MEANINGS = [
  { title: "Identidad", theme: "tu personalidad y la imagen que proyectas ante el mundo" },
  { title: "Recursos", theme: "tus valores, tu dinero y tu autoestima" },
  { title: "Comunicación", theme: "el aprendizaje, la comunicación y el entorno cercano" },
  { title: "Hogar", theme: "la familia, el hogar y las raíces emocionales" },
  { title: "Creatividad", theme: "la creatividad, el romance y el disfrute personal" },
  { title: "Rutina y salud", theme: "el trabajo diario, la salud y los hábitos" },
  { title: "Relaciones", theme: "las relaciones de pareja y las asociaciones" },
  { title: "Transformación", theme: "la transformación, la intimidad y los recursos compartidos" },
  { title: "Expansión", theme: "los viajes, el estudio y la búsqueda de sentido" },
  { title: "Vocación", theme: "la carrera, la vocación y el estatus público" },
  { title: "Comunidad", theme: "las amistades, los grupos y los proyectos futuros" },
  { title: "Interioridad", theme: "la vida interior, el descanso y el cierre de ciclos" }
];

function deg2rad(d) { return (d * Math.PI) / 180; }
function rad2deg(r) { return (r * 180) / Math.PI; }

function toJulianDay(year, month, day, hourUT) {
  let Y = year, M = month;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + hourUT / 24 + B - 1524.5;
}

function sunEclipticLongitude(T) {
  const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeDegrees(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = deg2rad(M);
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad);
  return normalizeDegrees(L0 + C);
}

// Longitud eclíptica lunar: suma de los términos periódicos dominantes de la teoría lunar
// (precisión aproximada de ±0.2-0.3°, suficiente para determinar signo y casa; no es una efeméride completa).
function moonEclipticLongitude(T) {
  const Lp = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = deg2rad(normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T));
  const M = deg2rad(normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T));
  const Mp = deg2rad(normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T));
  const F = deg2rad(normalizeDegrees(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T));

  let dl = 0;
  dl += 6.288774 * Math.sin(Mp);
  dl += 1.274027 * Math.sin(2 * D - Mp);
  dl += 0.658314 * Math.sin(2 * D);
  dl += 0.213618 * Math.sin(2 * Mp);
  dl -= 0.185116 * Math.sin(M);
  dl -= 0.114332 * Math.sin(2 * F);
  dl += 0.058793 * Math.sin(2 * D - 2 * Mp);
  dl += 0.057066 * Math.sin(2 * D - M - Mp);
  dl += 0.053322 * Math.sin(2 * D + Mp);
  dl += 0.045758 * Math.sin(2 * D - M);
  dl -= 0.040923 * Math.sin(M - Mp);
  dl -= 0.034720 * Math.sin(D);
  dl -= 0.030383 * Math.sin(M + Mp);

  return normalizeDegrees(Lp + dl);
}

function obliquity(T) {
  return 23.439291 - 0.0130042 * T - 0.00000016 * T * T + 0.000000504 * T * T * T;
}

function greenwichSiderealTime(JD) {
  const T = (JD - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
  return normalizeDegrees(gmst);
}

// Ascendente: derivado de la fórmula estándar de intersección eclíptica-horizonte,
// verificado con casos límite en latitud 0° (RAMC=0 -> Asc=90°, RAMC=90 -> Asc=180°).
function ascendantLongitude(ramcDeg, latDeg, epsDeg) {
  const ramc = deg2rad(ramcDeg);
  const eps = deg2rad(epsDeg);
  const lat = deg2rad(latDeg);
  const y = Math.cos(ramc);
  const x = -(Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(ramc));
  return normalizeDegrees(rad2deg(Math.atan2(y, x)));
}

/**
 * Calcula el Sol, la Luna y el Ascendente (con casas de Signos Enteros) a partir de
 * fecha/hora de nacimiento (hora local) y coordenadas geográficas.
 */
function computeBirthChart({ year, month, day, hour, minute, utcOffset, latitude, longitude }) {
  const utHour = hour + minute / 60 - utcOffset;
  const JD = toJulianDay(year, month, day, utHour);
  const T = (JD - 2451545.0) / 36525;

  const sunLon = sunEclipticLongitude(T);
  const moonLon = moonEclipticLongitude(T);
  const eps = obliquity(T);
  const gmst = greenwichSiderealTime(JD);
  const ramc = normalizeDegrees(gmst + longitude); // longitud positiva = Este
  const ascLon = ascendantLongitude(ramc, latitude, eps);

  const sunSign = getSignByLongitude(sunLon);
  const moonSign = getSignByLongitude(moonLon);
  const ascSign = getSignByLongitude(ascLon);

  const ascIndex = SIGNS_BY_LONGITUDE.indexOf(ascSign.name);
  const sunIndex = SIGNS_BY_LONGITUDE.indexOf(sunSign.name);
  const moonIndex = SIGNS_BY_LONGITUDE.indexOf(moonSign.name);

  const sunHouse = ((sunIndex - ascIndex + 12) % 12) + 1;
  const moonHouse = ((moonIndex - ascIndex + 12) % 12) + 1;

  return { sunSign, sunHouse, moonSign, moonHouse, ascSign };
}

function buildChartInterpretation(chart) {
  const sunHouseInfo = HOUSE_MEANINGS[chart.sunHouse - 1];
  const moonHouseInfo = HOUSE_MEANINGS[chart.moonHouse - 1];
  return `Tu Sol está en ${chart.sunSign.name}, en la Casa ${chart.sunHouse} (${sunHouseInfo.title}). Esto describe el núcleo de tu identidad: ${chart.sunSign.desc} Esta energía solar se enfoca especialmente en ${sunHouseInfo.theme}.

Tu Luna está en ${chart.moonSign.name}, en la Casa ${chart.moonHouse} (${moonHouseInfo.title}). La Luna representa tu mundo emocional e instintivo, así que sientes y reaccionas con rasgos propios de ${chart.moonSign.name}: ${chart.moonSign.desc} A nivel emocional, esto se vive sobre todo en torno a ${moonHouseInfo.theme}.

Tu Ascendente está en ${chart.ascSign.name}, el signo que marca cómo te presentas ante los demás en un primer momento: ${chart.ascSign.desc}`;
}

module.exports = { computeBirthChart, buildChartInterpretation, HOUSE_MEANINGS };
