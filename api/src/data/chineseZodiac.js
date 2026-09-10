const CHINESE_ANIMALS = [
  { name: "Rata", qualities: ["Ingeniosa", "Adaptable", "Ambiciosa", "Sociable", "Astuta"],
    desc: "La Rata es rápida de mente y muy adaptable, capaz de encontrar oportunidades donde otros no las ven. Es ambiciosa y encantadora en su trato social, aunque puede volverse calculadora bajo presión." },
  { name: "Buey", qualities: ["Perseverante", "Honesto", "Trabajador", "Metódico", "Terco"],
    desc: "El Buey avanza con paso firme y constante hacia sus metas. Es honesto y confiable, prefiere el método y la disciplina al riesgo, aunque su terquedad puede dificultar los cambios de rumbo." },
  { name: "Tigre", qualities: ["Valiente", "Carismático", "Impulsivo", "Independiente", "Competitivo"],
    desc: "El Tigre irradia valentía y magnetismo natural. Actúa por instinto y le cuesta seguir órdenes ajenas, prefiriendo trazar su propio camino con audacia." },
  { name: "Conejo", qualities: ["Amable", "Diplomático", "Prudente", "Sensible", "Elegante"],
    desc: "El Conejo busca la paz y la armonía por encima del conflicto. Es amable y diplomático, con un gusto refinado, aunque prefiere evitar la confrontación directa siempre que puede." },
  { name: "Dragón", qualities: ["Carismático", "Ambicioso", "Idealista", "Enérgico", "Orgulloso"],
    desc: "El Dragón es la figura más carismática del zodiaco chino, con una energía imparable y grandes aspiraciones. Inspira a otros de forma natural, aunque su orgullo puede chocar con quienes lo rodean." },
  { name: "Serpiente", qualities: ["Sabia", "Intuitiva", "Reservada", "Estratégica", "Elegante"],
    desc: "La Serpiente observa antes de actuar, confiando en su intuición y su capacidad de análisis. Es reservada y elegante, con una mente estratégica que rara vez revela sus verdaderas intenciones." },
  { name: "Caballo", qualities: ["Libre", "Enérgico", "Sociable", "Impaciente", "Aventurero"],
    desc: "El Caballo necesita movimiento y libertad constantes. Es sociable y enérgico, siempre en busca de la próxima aventura, aunque la rutina y las ataduras le resultan difíciles de sobrellevar." },
  { name: "Cabra", qualities: ["Creativa", "Empática", "Tranquila", "Artística", "Dependiente"],
    desc: "La Cabra tiene una sensibilidad artística marcada y una naturaleza empática. Prefiere ambientes tranquilos y armoniosos, y valora mucho el apoyo y la compañía de quienes ama." },
  { name: "Mono", qualities: ["Ingenioso", "Curioso", "Divertido", "Versátil", "Travieso"],
    desc: "El Mono destaca por su ingenio rápido y su curiosidad insaciable. Es divertido y versátil, capaz de resolver problemas con creatividad, aunque su lado travieso a veces lo mete en líos." },
  { name: "Gallo", qualities: ["Observador", "Organizado", "Franco", "Trabajador", "Orgulloso"],
    desc: "El Gallo es meticuloso y organizado, con un ojo agudo para el detalle. Habla con franqueza y se enorgullece de su trabajo, buscando siempre hacer las cosas de forma correcta y visible." },
  { name: "Perro", qualities: ["Leal", "Honesto", "Protector", "Justo", "Ansioso"],
    desc: "El Perro es el guardián leal del zodiaco chino, guiado por un fuerte sentido de la justicia. Es honesto y protector con los suyos, aunque tiende a preocuparse en exceso por lo que podría salir mal." },
  { name: "Cerdo", qualities: ["Generoso", "Sincero", "Tolerante", "Optimista", "Disfrutón"],
    desc: "El Cerdo disfruta de los placeres simples de la vida con generosidad y buen humor. Es sincero y tolerante con los demás, y suele ver el lado positivo incluso en las situaciones difíciles." }
];

const CHINESE_ELEMENTS = [
  { name: "Metal", qualities: ["Firme", "Ambicioso", "Directo"], desc: "aporta firmeza, determinación y un fuerte sentido de la ambición." },
  { name: "Agua", qualities: ["Flexible", "Intuitivo", "Diplomático"], desc: "aporta fluidez, intuición y facilidad para adaptarse a los cambios." },
  { name: "Madera", qualities: ["Generoso", "Cooperativo", "Idealista"], desc: "aporta crecimiento, generosidad y una visión idealista de las relaciones." },
  { name: "Fuego", qualities: ["Apasionado", "Dinámico", "Impulsivo"], desc: "aporta pasión, dinamismo y una energía impulsiva y expresiva." },
  { name: "Tierra", qualities: ["Estable", "Práctico", "Confiable"], desc: "aporta estabilidad, sentido práctico y una naturaleza confiable." }
];

// Índice de elemento chino según el último dígito del año: 0,1=Metal 2,3=Agua 4,5=Madera 6,7=Fuego 8,9=Tierra
const ELEMENT_BY_LAST_DIGIT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

module.exports = { CHINESE_ANIMALS, CHINESE_ELEMENTS, ELEMENT_BY_LAST_DIGIT };
