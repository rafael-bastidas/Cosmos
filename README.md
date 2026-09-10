# Cosmos

Calcula 4 arquetipos de personalidad a partir de datos de nacimiento: **signo zodiacal**,
**horóscopo chino**, **carta astral** (Sol, Luna, Ascendente) y **eneatipo** (test de 45
afirmaciones).

## Contenido del repo

- **[`index.html`](index.html)** — prototipo original en un solo archivo, sin backend
  (todos los cálculos en JavaScript de cliente). Ábrelo directo en el navegador, funciona
  de forma independiente del resto del repo.
- **[`api/`](api/README.md)** — API HTTP (Node/Express) que expone los mismos cálculos,
  pensada para ser consumida tanto por la web de este repo como por cualquier otro proyecto.
- **[`web/`](web/)** — wizard paso a paso (HTML/CSS/JS plano, sin build) que consume la API
  para guiar al usuario y mostrar los resultados en pestañas.

## Uso rápido

```bash
cd api
npm install
npm start
```

Abre `http://localhost:3001` (la API sirve la web de `web/` en la misma URL).

Para más detalle: [`api/README.md`](api/README.md) documenta el contrato completo de la API
(útil si quieres consumirla desde otro proyecto), y [`AGENTS.md`](AGENTS.md) documenta la
arquitectura y las decisiones de implementación no obvias, pensado para agentes de IA que
trabajen en este repo.
