const ENNEAGRAM_TYPES = {
  1: { name: "El Reformador", center: "Instintivo", qualities: ["Íntegro", "Meticuloso", "Responsable", "Crítico", "Idealista"],
    fear: "Ser corrupto, malo o defectuoso.", desire: "Ser bueno, tener integridad y estar en equilibrio.",
    desc: "Los Uno buscan la perfección y actúan guiados por un fuerte sentido del deber y la ética. Son organizados, disciplinados y muy autoexigentes, con una voz interior crítica que señala lo que \"debería\" hacerse. Cuando están sanos son sabios y realistas; bajo estrés pueden volverse rígidos y críticos." },
  2: { name: "El Ayudador", center: "Emocional", qualities: ["Generoso", "Empático", "Complaciente", "Cálido", "Orgulloso"],
    fear: "Ser indigno de amor si no ayuda a otros.", desire: "Sentirse amado y necesitado.",
    desc: "Los Dos se orientan hacia las necesidades de los demás y encuentran su valor en dar amor y apoyo. Son cálidos, generosos y perceptivos frente a las emociones ajenas, aunque pueden descuidar sus propias necesidades y buscar reconocimiento a cambio de su ayuda." },
  3: { name: "El Triunfador", center: "Emocional", qualities: ["Ambicioso", "Eficiente", "Adaptable", "Competitivo", "Orientado a metas"],
    fear: "Ser sin valor fuera de sus logros.", desire: "Sentirse valioso y admirado.",
    desc: "Los Tres se centran en el logro, la imagen y el éxito. Son eficientes, motivados y capaces de adaptarse rápidamente para alcanzar sus objetivos, aunque pueden perder contacto con sus propios sentimientos al priorizar la imagen que proyectan." },
  4: { name: "El Individualista", center: "Emocional", qualities: ["Sensible", "Creativo", "Introspectivo", "Melancólico", "Auténtico"],
    fear: "No tener identidad ni significado personal.", desire: "Encontrar su propia identidad y significado interior.",
    desc: "Los Cuatro buscan profundidad, autenticidad y significado personal. Son creativos y emocionalmente intensos, con una rica vida interior, aunque tienden a sentirse diferentes de los demás y pueden idealizar lo ausente o lo que falta." },
  5: { name: "El Investigador", center: "Mental", qualities: ["Analítico", "Reservado", "Curioso", "Independiente", "Observador"],
    fear: "Ser invadido, incapaz o incompetente.", desire: "Ser competente y comprender el mundo.",
    desc: "Los Cinco buscan conocimiento y comprensión antes de actuar. Son observadores, independientes y valoran mucho su privacidad y su energía, prefiriendo retirarse a analizar en lugar de involucrarse emocionalmente de forma inmediata." },
  6: { name: "El Leal", center: "Mental", qualities: ["Leal", "Prevenido", "Responsable", "Ansioso", "Comprometido"],
    fear: "Quedarse sin apoyo ni guía.", desire: "Tener seguridad y apoyo.",
    desc: "Los Seis buscan seguridad y certeza frente a un mundo que perciben incierto. Son leales, responsables y buenos para anticipar riesgos, aunque pueden oscilar entre la duda y la necesidad de autoridad o de rebelarse contra ella." },
  7: { name: "El Entusiasta", center: "Mental", qualities: ["Optimista", "Espontáneo", "Versátil", "Disperso", "Aventurero"],
    fear: "Quedar atrapado en el dolor o la privación.", desire: "Estar satisfecho y contento, evitando el sufrimiento.",
    desc: "Los Siete buscan experiencias nuevas y placenteras, evitando el dolor y el aburrimiento. Son optimistas, entusiastas y llenos de ideas, aunque pueden dispersarse fácilmente y evitar profundizar en emociones difíciles." },
  8: { name: "El Retador", center: "Instintivo", qualities: ["Fuerte", "Decidido", "Protector", "Confrontador", "Directo"],
    fear: "Ser controlado o vulnerable ante otros.", desire: "Protegerse y decidir su propio destino.",
    desc: "Los Ocho buscan tener el control de su vida y proyectan fuerza y seguridad. Son directos, protectores con los suyos y no temen el conflicto, aunque pueden volverse dominantes o intimidantes cuando se sienten vulnerables." },
  9: { name: "El Pacificador", center: "Instintivo", qualities: ["Tranquilo", "Conciliador", "Complaciente", "Disperso", "Receptivo"],
    fear: "Perder la conexión y fragmentarse.", desire: "Mantener la paz interior y la armonía.",
    desc: "Los Nueve buscan armonía y evitan el conflicto, fusionándose fácilmente con las agendas de los demás. Son receptivos, pacientes y buenos mediadores, aunque pueden postergar sus propias prioridades y evitar el conflicto necesario." }
};

const ENNEAGRAM_CENTERS = {
  Instintivo: { label: "Instintivo (Cuerpo · Ira)", desc: "reacciona desde el instinto y la gestión de la ira y el control; le preocupa la autonomía frente al entorno." },
  Emocional: { label: "Emocional (Corazón · Vergüenza)", desc: "reacciona desde la imagen y la emoción; le preocupa su valor propio y cómo es percibido por los demás." },
  Mental: { label: "Mental (Cabeza · Miedo)", desc: "reacciona desde el análisis y la anticipación; le preocupa la seguridad y la certeza frente al miedo." }
};

const ENNEAGRAM_WINGS = { 1: [9, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5], 5: [4, 6], 6: [5, 7], 7: [6, 8], 8: [7, 9], 9: [8, 1] };
const ENNEAGRAM_INTEGRATION = { 1: 7, 2: 4, 3: 6, 4: 1, 5: 8, 6: 9, 7: 5, 8: 2, 9: 3 };
const ENNEAGRAM_DISINTEGRATION = { 1: 4, 2: 8, 3: 9, 4: 2, 5: 7, 6: 3, 7: 1, 8: 5, 9: 6 };

// 5 afirmaciones por tipo (45 en total). El id de cada una es estable: se usa como llave
// en el campo `answers` del POST /api/archetypes/calculate.
const ENNEAGRAM_QUESTIONS_BY_TYPE = {
  1: [
    "Me esfuerzo por hacer las cosas correctamente y me cuesta aceptar los errores.",
    "Tengo un fuerte sentido de lo que está bien y lo que está mal.",
    "Suelo ser autocrítico/a y crítico/a con los demás cuando algo no se hace bien.",
    "Me gusta que las cosas estén ordenadas, organizadas y en su lugar.",
    "Siento una voz interior que me dice constantemente cómo \"debería\" actuar."
  ],
  2: [
    "Me resulta fácil detectar las necesidades de los demás antes que las mías.",
    "Disfruto ayudando a otros y sintiéndome necesario/a para ellos.",
    "A veces doy más de lo que puedo para ganarme el afecto de los demás.",
    "Me cuesta pedir ayuda; prefiero ser quien la da.",
    "Busco sentirme querido/a a través de mis actos de generosidad."
  ],
  3: [
    "Me motiva mucho alcanzar metas y ser reconocido/a por mis logros.",
    "Adapto fácilmente mi imagen según la situación para causar una buena impresión.",
    "Me cuesta detenerme; siempre estoy enfocado/a en el siguiente objetivo.",
    "El éxito y la eficiencia son muy importantes para mi autoestima.",
    "Prefiero mostrar una imagen de éxito antes que mostrar mis dudas o fracasos."
  ],
  4: [
    "Siento que soy diferente a los demás de una manera significativa.",
    "Mi mundo emocional es intenso y profundo, y valoro la autenticidad.",
    "Me atrae lo melancólico, lo estético y lo que tiene un significado profundo.",
    "A veces idealizo lo que no tengo o lo que está ausente.",
    "Busco expresar quién soy realmente a través de la creatividad o el sentimiento."
  ],
  5: [
    "Prefiero observar y analizar antes de involucrarme en una situación.",
    "Necesito tiempo y espacio a solas para recargar energía.",
    "Valoro mucho el conocimiento y la comprensión de cómo funcionan las cosas.",
    "Me cuesta compartir mis emociones o mi vida privada con otros.",
    "Prefiero mantener cierta distancia para no sentirme invadido/a por los demás."
  ],
  6: [
    "Suelo anticipar problemas y prepararme para lo que podría salir mal.",
    "Valoro mucho la lealtad y el compromiso en mis relaciones.",
    "A veces dudo de mis propias decisiones y busco la opinión de otros.",
    "Me preocupa no tener suficiente apoyo o seguridad.",
    "Puedo desconfiar de la autoridad o, por el contrario, apoyarme fuertemente en ella."
  ],
  7: [
    "Me gusta tener muchas opciones y experiencias nuevas disponibles.",
    "Tiendo a evitar el malestar buscando distracciones o planes divertidos.",
    "Soy optimista y me entusiasmo fácilmente con nuevas ideas.",
    "Me cuesta comprometerme con una sola cosa cuando hay tantas posibilidades.",
    "Prefiero centrarme en lo positivo antes que quedarme en el dolor o la rutina."
  ],
  8: [
    "Me gusta tener el control de las situaciones importantes en mi vida.",
    "No temo el conflicto directo cuando es necesario defender mi postura.",
    "Protejo con fuerza a las personas que considero mías.",
    "Prefiero mostrar fortaleza antes que mostrar vulnerabilidad.",
    "Tiendo a tomar el mando de forma natural en grupos o situaciones difíciles."
  ],
  9: [
    "Prefiero mantener la paz antes que entrar en conflicto.",
    "Me adapto fácilmente a los deseos o planes de los demás.",
    "A veces postergo decisiones importantes o evito confrontar mis propias prioridades.",
    "Me cuesta identificar con claridad lo que realmente quiero.",
    "Busco armonía y estabilidad en mi entorno."
  ]
};

// Lista plana [{id, type, text}] derivada de ENNEAGRAM_QUESTIONS_BY_TYPE; id estable tipo "ennea_<type>_<index>".
const ENNEAGRAM_QUESTIONS = Object.entries(ENNEAGRAM_QUESTIONS_BY_TYPE).flatMap(([type, texts]) =>
  texts.map((text, i) => ({ id: `ennea_${type}_${i}`, type: Number(type), text }))
);

module.exports = {
  ENNEAGRAM_TYPES,
  ENNEAGRAM_CENTERS,
  ENNEAGRAM_WINGS,
  ENNEAGRAM_INTEGRATION,
  ENNEAGRAM_DISINTEGRATION,
  ENNEAGRAM_QUESTIONS
};
