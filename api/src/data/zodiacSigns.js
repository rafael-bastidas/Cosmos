// Los 12 signos del zodiaco occidental, en orden zodiacal empezando en Aries (0° eclípticos).
// `start`/`end` son fechas [mes, día] usadas para determinar el signo a partir de una fecha de nacimiento.
const ZODIAC_SIGNS = [
  { name: "Aries", start: [3, 21], end: [4, 19], planet: "Marte", element: "Fuego", modality: "Cardinal",
    qualities: ["Valiente", "Enérgico", "Impulsivo", "Líder", "Competitivo"],
    desc: "Aries abre el ciclo zodiacal con una energía directa y pionera. Le gusta iniciar, competir y actuar rápido, mostrando coraje natural aunque a veces le falte paciencia para los procesos lentos." },
  { name: "Tauro", start: [4, 20], end: [5, 20], planet: "Venus", element: "Tierra", modality: "Fijo",
    qualities: ["Paciente", "Práctico", "Sensual", "Terco", "Leal"],
    desc: "Tauro busca estabilidad, confort y placer sensorial. Es constante y confiable, con un aprecio profundo por lo material y lo bello, aunque puede resistirse fuertemente al cambio." },
  { name: "Géminis", start: [5, 21], end: [6, 20], planet: "Mercurio", element: "Aire", modality: "Mutable",
    qualities: ["Curioso", "Comunicativo", "Adaptable", "Versátil", "Ingenioso"],
    desc: "Géminis vive de la curiosidad y el intercambio de ideas. Es rápido mentalmente, sociable y adaptable a casi cualquier contexto, aunque puede dispersarse entre demasiados intereses a la vez." },
  { name: "Cáncer", start: [6, 21], end: [7, 22], planet: "Luna", element: "Agua", modality: "Cardinal",
    qualities: ["Sensible", "Protector", "Intuitivo", "Emocional", "Hogareño"],
    desc: "Cáncer conecta con el mundo a través de las emociones y los vínculos cercanos. Es protector con los suyos y muy intuitivo, con una memoria emocional profunda y necesidad de un hogar seguro." },
  { name: "Leo", start: [7, 23], end: [8, 22], planet: "Sol", element: "Fuego", modality: "Fijo",
    qualities: ["Carismático", "Generoso", "Orgulloso", "Creativo", "Dominante"],
    desc: "Leo brilla con una presencia cálida y magnética. Es generoso y creativo, disfruta ser reconocido y liderar, y pone corazón y lealtad en todo lo que le apasiona." },
  { name: "Virgo", start: [8, 23], end: [9, 22], planet: "Mercurio", element: "Tierra", modality: "Mutable",
    qualities: ["Analítico", "Meticuloso", "Servicial", "Perfeccionista", "Práctico"],
    desc: "Virgo se distingue por su mente analítica y su afán de mejora continua. Es servicial y detallista, con un enfoque práctico para resolver problemas, aunque puede ser muy exigente consigo mismo." },
  { name: "Libra", start: [9, 23], end: [10, 22], planet: "Venus", element: "Aire", modality: "Cardinal",
    qualities: ["Diplomático", "Equilibrado", "Sociable", "Indeciso", "Estético"],
    desc: "Libra busca armonía, belleza y justicia en sus relaciones. Es diplomático y sociable por naturaleza, sopesando siempre distintas perspectivas antes de decidir." },
  { name: "Escorpio", start: [10, 23], end: [11, 21], planet: "Plutón", element: "Agua", modality: "Fijo",
    qualities: ["Intenso", "Apasionado", "Misterioso", "Decidido", "Leal"],
    desc: "Escorpio vive con una intensidad emocional profunda y una voluntad férrea. Es leal y apasionado con quienes se gana su confianza, y no teme enfrentar lo oculto o lo transformador." },
  { name: "Sagitario", start: [11, 22], end: [12, 21], planet: "Júpiter", element: "Fuego", modality: "Mutable",
    qualities: ["Aventurero", "Optimista", "Filosófico", "Honesto", "Inquieto"],
    desc: "Sagitario busca expandir horizontes, ya sea viajando, estudiando o filosofando sobre la vida. Es optimista y directo, con una sed constante de libertad y nuevas experiencias." },
  { name: "Capricornio", start: [12, 22], end: [1, 19], planet: "Saturno", element: "Tierra", modality: "Cardinal",
    qualities: ["Disciplinado", "Ambicioso", "Responsable", "Paciente", "Reservado"],
    desc: "Capricornio es un signo constante y orientado a metas a largo plazo. Valora el esfuerzo, la estructura y los resultados tangibles, y suele mostrar una madurez que contrasta con su lado más lúdico y seco de humor." },
  { name: "Acuario", start: [1, 20], end: [2, 18], planet: "Urano", element: "Aire", modality: "Fijo",
    qualities: ["Innovador", "Independiente", "Humanitario", "Excéntrico", "Idealista"],
    desc: "Acuario piensa en grande y a menudo por delante de su tiempo. Es independiente hasta la terquedad, con una mirada puesta en el colectivo y una necesidad constante de libertad y originalidad." },
  { name: "Piscis", start: [2, 19], end: [3, 20], planet: "Neptuno", element: "Agua", modality: "Mutable",
    qualities: ["Soñador", "Compasivo", "Intuitivo", "Artístico", "Emocional"],
    desc: "Piscis es el más sensible e imaginativo del zodiaco. Se mueve con empatía y una fuerte conexión emocional con los demás, a veces refugiándose en la fantasía o el arte para procesar el mundo." }
];

// Orden zodiacal por longitud eclíptica (cada signo ocupa 30°, empezando en Aries = 0°).
const SIGNS_BY_LONGITUDE = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];

module.exports = { ZODIAC_SIGNS, SIGNS_BY_LONGITUDE };
