const path = require("path");
const express = require("express");
const cors = require("cors");
const archetypesRouter = require("./routes/archetypes");
const placesRouter = require("./routes/places");

const app = express();
const PORT = process.env.PORT || 3002;

// Abierta a cualquier origen a prop?sito: es una API p?blica de solo c?lculo (sin
// autenticaci?n ni datos persistidos) pensada para ser consumida desde otros proyectos.
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/places", placesRouter);
app.use("/api/archetypes", archetypesRouter);

// Sirve la web (wizard) como est?tico para desarrollo local con un solo comando.
app.use(express.static(path.join(__dirname, "..", "..", "web")));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petici?n debe ser JSON v?lido." });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cosmos API escuchando en http://0.0.0.0:${PORT}`);
});
