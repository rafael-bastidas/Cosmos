# Cosmos API

API de solo cálculo (sin base de datos, sin autenticación) que determina 4 arquetipos de
personalidad a partir de datos de nacimiento:

- **Signo zodiacal** (occidental)
- **Horóscopo chino** (animal + elemento)
- **Carta astral** (Sol, Luna y Ascendente, con casas de Signos Enteros)
- **Eneatipo** (a partir de un test de 45 afirmaciones)

Pensada para ser consumida tanto por la web wizard de este mismo repo (`../web`) como por
**cualquier otro proyecto** que quiera calcular y pintar estos arquetipos con su propia interfaz.

## Ejecutar

```bash
cd api
npm install
npm start        # http://localhost:3001
```

Variable de entorno opcional: `PORT` (por defecto `3001`).

CORS está abierto a cualquier origen (`*`) a propósito: es una API pública de solo cálculo,
sin datos sensibles ni persistencia, diseñada para integrarse desde otros dominios.

## Flujo de uso (para un agente de IA o un desarrollador integrando esta API)

1. **`GET /api/archetypes/questions`** — te dice exactamente qué datos pedirle al usuario:
   los campos de nacimiento (fecha, hora, desfase UTC, latitud, longitud, lugar) y la lista
   completa de las 45 afirmaciones del eneagrama con sus ids estables.
2. Recolecta esos datos del usuario (con el formulario, wizard o interfaz que prefieras).
3. **`POST /api/archetypes/calculate`** — envía lo que hayas recolectado (puede ser parcial)
   y recibe los arquetipos calculados, listos para mostrar.

Todo el body del POST es opcional: la API calcula únicamente los arquetipos para los que
recibió datos suficientes, y explica en `notes` cuáles omitió y por qué. Esto permite un
flujo por pasos (wizard) donde el usuario elige qué arquetipos quiere conocer.

## `GET /api/archetypes/questions`

Respuesta (recortada):

```json
{
  "description": "...",
  "birthInfo": {
    "date": { "field": "date", "type": "string", "format": "YYYY-MM-DD", "required": false, "description": "..." },
    "time": { "field": "time", "type": "string", "format": "HH:MM (24h)", "required": false, "description": "..." },
    "utcOffset": { "field": "utcOffset", "type": "number", "example": -5, "required": false, "description": "..." },
    "latitude": { "field": "latitude", "type": "number", "range": [-90, 90], "example": 4.71, "required": false, "description": "..." },
    "longitude": { "field": "longitude", "type": "number", "range": [-180, 180], "example": -74.07, "required": false, "description": "..." },
    "place": { "field": "place", "type": "string", "required": false, "description": "Solo informativo." }
  },
  "enneagram": {
    "instructions": "Responde cada afirmación de 1 (muy en desacuerdo) a 5 (muy de acuerdo) y envíalas en `answers` como { [id]: valor }.",
    "totalQuestions": 45,
    "questions": [
      { "id": "ennea_1_0", "text": "Me esfuerzo por hacer las cosas correctamente y me cuesta aceptar los errores." },
      { "id": "ennea_1_1", "text": "..." }
    ]
  }
}
```

## `POST /api/archetypes/calculate`

### Body

Todos los campos son opcionales. Envía solo lo que tengas:

| Campo | Tipo | Necesario para |
|---|---|---|
| `date` | `"YYYY-MM-DD"` | Zodiaco, Horóscopo chino, Carta astral |
| `time` | `"HH:MM"` (24h) | Carta astral |
| `utcOffset` | número (-12 a 14), ej. `-5` | Carta astral |
| `latitude` | número (-90 a 90) | Carta astral |
| `longitude` | número (-180 a 180) | Carta astral |
| `place` | string | Solo informativo (no afecta el cálculo) |
| `answers` | `{ [questionId]: 1-5 }` | Eneatipo |

Ejemplo con todo:

```json
{
  "date": "1990-06-15",
  "time": "08:30",
  "utcOffset": -5,
  "latitude": 4.6097,
  "longitude": -74.0817,
  "place": "Bogotá, Colombia",
  "answers": { "ennea_1_0": 4, "ennea_1_1": 2, "ennea_6_0": 5 }
}
```

Solo con fecha (obtienes zodiaco + horóscopo chino, nada más):

```json
{ "date": "1990-06-15" }
```

Solo eneagrama (sin datos de nacimiento):

```json
{ "answers": { "ennea_1_0": 4, "...": 3 } }
```

### Respuesta

```json
{
  "zodiac": {
    "name": "Géminis", "planet": "Mercurio", "element": "Aire", "modality": "Mutable",
    "qualities": ["Curioso", "Comunicativo", "Adaptable", "Versátil", "Ingenioso"],
    "description": "..."
  },
  "chinese": {
    "animal": "Caballo", "element": "Metal", "year": 1990,
    "qualities": ["Libre", "Enérgico", "...", "Firme", "Ambicioso", "Directo"],
    "description": "..."
  },
  "birthChart": {
    "sunSign": "Géminis", "sunHouse": 11,
    "moonSign": "Piscis", "moonHouse": 8,
    "ascendantSign": "Leo",
    "houseSystem": "Signos Enteros (Whole Sign)",
    "qualities": ["Curioso", "Comunicativo", "Soñador", "Compasivo", "Carismático", "Generoso"],
    "description": "..."
  },
  "enneagram": {
    "mainType": 6, "mainTypeName": "El Leal",
    "wing": "6w5", "wingType": 5, "wingTypeName": "El Investigador",
    "center": "Mental (Cabeza · Miedo)",
    "integration": { "type": 9, "name": "El Pacificador" },
    "disintegration": { "type": 3, "name": "El Triunfador" },
    "qualities": ["Leal", "Prevenido", "Responsable", "Ansioso", "Comprometido"],
    "description": "...",
    "scores": { "1": 10, "2": 10, "3": 10, "4": 10, "5": 10, "6": 25, "7": 10, "8": 10, "9": 20 },
    "answeredQuestions": 45, "totalQuestions": 45
  },
  "notes": []
}
```

Cualquier arquetipo sin datos suficientes viene como `null`, y `notes` explica el motivo,
por ejemplo: `"birthChart: se omitió; faltan o son inválidos: time, utcOffset (-12 a 14)."`

### Errores

`400` con `{ "error": "..." }` si `date`/`time` tienen formato inválido, o si el body no es
JSON válido. Los campos de carta astral fuera de rango se tratan como faltantes (se omite
`birthChart` y se explica en `notes`) en vez de fallar toda la petición.

## Notas de implementación

- **Carta astral**: posición eclíptica del Sol y la Luna calculadas con fórmulas de baja
  precisión (Meeus/serie lunar reducida, error aproximado ±0.2-0.3° en la Luna), tiempo
  sidéreo de Greenwich y fórmula estándar del Ascendente. Casas: **Signos Enteros** (la
  casa 1 es el signo del Ascendente; no se calculan cúspides Placidus). Es una aproximación
  razonable, no un cálculo de efeméride profesional — cerca de un límite de signo (~1°) el
  resultado podría diferir de un software astrológico certificado.
- **Eneagrama**: modelo clásico Riso-Hudson (alas adyacentes, flechas de integración/
  desintegración). Las preguntas no respondidas en `answers` se tratan como neutras (3),
  para poder calcular con respuestas parciales.
- Ver `../AGENTS.md` en la raíz del repo para el contexto completo del proyecto.
