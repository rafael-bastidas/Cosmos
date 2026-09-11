const path = require("path");
const express = require("express");
const cors = require("cors");
const archetypesRouter = require("./routes/archetypes");

const app = express();
const PORT = process.env.PORT || 3002;

// Abierta a cualquier origen a propósito: es una API pública de solo cálculo (sin
// autenticación ni datos persistidos) pensada para ser consumida desde otros proyectos.
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/archetypes", archetypesRouter);

// Sirve la web (wizard) como estático para desarrollo local con un solo comando.
app.use(express.static(path.join(__dirname, "..", "..", "web")));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición debe ser JSON válido." });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cosmos API escuchando en http://0.0.0.0:${PORT}`);
});
