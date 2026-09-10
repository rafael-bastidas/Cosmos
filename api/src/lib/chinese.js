const { CHINESE_ANIMALS, CHINESE_ELEMENTS, ELEMENT_BY_LAST_DIGIT } = require("../data/chineseZodiac");

function getChineseHoroscope(year) {
  const animalIndex = ((year - 4) % 12 + 12) % 12;
  const elementIndex = ELEMENT_BY_LAST_DIGIT[((year % 10) + 10) % 10];
  return { animal: CHINESE_ANIMALS[animalIndex], element: CHINESE_ELEMENTS[elementIndex] };
}

module.exports = { getChineseHoroscope };
