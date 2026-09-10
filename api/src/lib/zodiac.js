const { ZODIAC_SIGNS, SIGNS_BY_LONGITUDE } = require("../data/zodiacSigns");

function getWesternSignByDate(month, day) {
  const md = month * 100 + day;
  return ZODIAC_SIGNS.find(sign => {
    const startMd = sign.start[0] * 100 + sign.start[1];
    const endMd = sign.end[0] * 100 + sign.end[1];
    if (startMd <= endMd) return md >= startMd && md <= endMd;
    return md >= startMd || md <= endMd; // envuelve el año nuevo (Capricornio)
  });
}

function normalizeDegrees(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function getSignByLongitude(longitude) {
  const index = Math.floor(normalizeDegrees(longitude) / 30) % 12;
  const name = SIGNS_BY_LONGITUDE[index];
  return ZODIAC_SIGNS.find(s => s.name === name);
}

module.exports = { getWesternSignByDate, getSignByLongitude, normalizeDegrees, SIGNS_BY_LONGITUDE };
