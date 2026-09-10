# AGENTS.md — Guía para agentes de IA que trabajen en este repo

Este documento existe para que un agente de IA (o una persona nueva) entienda rápido cómo
está armado el proyecto **Cosmos**, sin tener que releer todo el historial de conversación
que lo originó.

## Qué es esto

Cosmos calcula 4 arquetipos de personalidad a partir de datos de nacimiento, todo en
español:

1. **Signo zodiacal** (occidental) — a partir de la fecha de nacimiento.
2. **Horóscopo chino** — animal + elemento, a partir del año de nacimiento.
3. **Carta astral** — Sol, Luna y Ascendente (con casas), a partir de fecha, hora y lugar
   de nacimiento.
4. **Eneatipo** — a partir de un test de 45 afirmaciones (escala 1-5).

## Estructura del repo

```
Cosmos/
├── index.html        # Prototipo original: todo en un solo archivo HTML, sin backend,
│                      # todos los cálculos en JS de cliente. Sigue funcionando de forma
│                      # independiente (ábrelo directo en el navegador). No se toca al
│                      # modificar api/ o web/: son un proyecto nuevo y separado.
├── api/               # Backend Express: expone los cálculos como API HTTP.
│   └── src/
│       ├── data/      # Datos "de contenido": signos, animales chinos, tipos de eneagrama,
│       │               # las 45 preguntas del test. Cambia AQUÍ el texto/descripciones.
│       ├── lib/        # Lógica de cálculo pura (sin Express), una función por arquetipo.
│       ├── routes/      # archetypes.js: GET /questions y POST /calculate.
│       └── server.js    # Monta todo + sirve ../../web como estático.
└── web/               # Frontend wizard: HTML/CSS/JS plano (sin build, sin framework),
                        # consume la API de arriba vía fetch. Pensado como referencia de
                        # cómo integrar la API desde CUALQUIER otro proyecto.
```

**Por qué existen dos implementaciones (`index.html` suelto y `api/`+`web/`):** el archivo
raíz fue el primer prototipo (todo client-side). Después se pidió una arquitectura API+web
para que **otros proyectos externos** también puedan consumir los cálculos vía HTTP y pintar
los resultados con su propia interfaz — de ahí que la lógica se haya movido a un backend con
un contrato HTTP documentado (`api/README.md`), y la web de este repo sea solo *un* consumidor
más de esa API, no la fuente de verdad.

## Cómo correr todo

```bash
cd api
npm install
npm start   # http://localhost:3001 — sirve la API y, en la misma URL, la web (web/)
```

No hay paso de build. `web/` es HTML/CSS/JS plano; si necesitas servirla por separado de la
API, cambia `window.COSMOS_CONFIG.apiBase` en `web/js/config.js` a la URL absoluta de la API.

## El contrato de la API (resumen; ver `api/README.md` para el detalle completo)

- `GET /api/archetypes/questions` → describe qué datos pedir al usuario (campos de
  nacimiento + las 45 preguntas del eneagrama con id estable).
- `POST /api/archetypes/calculate` → recibe esos datos (parciales está bien) y devuelve
  `{ zodiac, chinese, birthChart, enneagram, notes }`, con `null` en lo que no se pudo
  calcular por falta de datos.

Esto es intencional: permite un flujo tipo wizard donde el usuario elige qué arquetipos
quiere conocer, sin que el cliente tenga que duplicar la lógica de qué se puede calcular
con qué.

## Detalles no obvios (léelos antes de tocar la lógica de cálculo)

- **Carta astral** (`api/src/lib/birthChart.js`): usa fórmulas de baja precisión para el Sol
  (Meeus, ~0.01°) y la Luna (13 términos principales de la teoría lunar, ~±0.2-0.3°), tiempo
  sidéreo de Greenwich estándar, y una fórmula del Ascendente **derivada y verificada a mano**
  con casos límite (latitud 0°, RAMC=0°→Asc=90°, RAMC=90°→Asc=180°) porque las fuentes
  memorizadas tenían un desfase de signo de 180°. Las casas usan el sistema **Signos
  Enteros** (whole sign) — no Placidus — precisamente para evitar la complejidad/errores de
  calcular cúspides de casas reales sin una librería de efemérides. Sanity check ya hecho:
  con hora ≈mediodía el Sol cae en Casa 10 (cerca del MC) y a medianoche en Casa 4 (cerca del
  IC), como debe ser.
- **Eneagrama** (`api/src/lib/enneagram.js`, `api/src/data/enneagram.js`): modelo clásico
  Riso-Hudson. Mapas fijos: `ENNEAGRAM_WINGS` (alas adyacentes), `ENNEAGRAM_INTEGRATION` /
  `ENNEAGRAM_DISINTEGRATION` (flechas de crecimiento/estrés). Los ids de las 45 preguntas
  (`ennea_<tipo>_<índice>`) son estables — no los cambies sin coordinar con quien ya esté
  usando la API, porque el consumidor los usa como llaves en `answers`.
- **Geocodificación** (`web/js/app.js`, función `searchPlace`): usa la API pública gratuita
  de Open-Meteo (`geocoding-api.open-meteo.com`, sin API key) para convertir un nombre de
  lugar en lat/lon + zona horaria IANA. El desfase UTC exacto para la carta astral se calcula
  con `Intl.DateTimeFormat(..., { timeZoneName: "longOffset" })` del propio navegador,
  usando esa zona horaria y la fecha de nacimiento, para respetar el horario de verano
  vigente en ese momento histórico. Esto vive en el cliente (`web/`), no en la API, porque
  es una utilidad de UX (autocompletar el formulario), no parte del cálculo de arquetipos.
- **Horóscopo chino** (`api/src/lib/chinese.js`): usa el año gregoriano de nacimiento
  directamente (sin ajustar por la fecha exacta del Año Nuevo lunar, que varía entre el 21
  de enero y el 20 de febrero). Es una simplificación conocida y aceptada, no un bug.
- **CORS**: la API tiene CORS abierto a cualquier origen a propósito (`api/src/server.js`).
  Es intencional dado el caso de uso (consumo desde proyectos externos) — no lo restrinjas
  sin que te lo pidan explícitamente.

## Convenciones del proyecto

- Todo el contenido de cara al usuario (UI, descripciones, mensajes de la API) está en
  **español**.
- `api/` usa CommonJS (`require`/`module.exports`), no ESM — así arranca con `node
  src/server.js` sin configuración extra.
- `web/` es JS plano sin build (sin React/Vite/webpack). El "framework" de UI en
  `web/js/app.js` es una función `el(tag, props, children)` casera + un `render()` que
  reconstruye `#app` en cada cambio de estado — no una librería real. Si el proyecto crece
  mucho más, considera migrar a algo con manejo de estado real, pero no lo hagas
  preventivamente.
- Mantén los datos "de contenido" (textos, cualidades, preguntas) separados de la lógica de
  cálculo (`api/src/data/` vs `api/src/lib/`) — ya está así, respétalo al editar.

## Git

El repo se sincroniza con `git@github.com:rafael-bastidas/Cosmos.git` (rama `main`).
