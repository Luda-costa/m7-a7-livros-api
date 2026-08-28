import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  conectarBanco,
  livrosCollection
} from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// rotas
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/livros", async (_req, res) => {
  try {
    const livros = await livrosCollection()
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    res.json(livros);
  } catch {
    res.status(500).json({
      erro: "Erro ao listar livros."
    });
  }
});

app.get("/api/livros/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  const livro = await livrosCollection().findOne(
    { id },
    { projection: { _id: 0 } }
  );

  if (!livro) {
    return res.status(404).json({
      erro: "Livro não encontrado."
    });
  }

  res.json(livro);
});

app.post("/api/livros", async (req, res) => {
  const {
    titulo,
    descricao,
    categoria,
    status,
    autor,
    ano
  } = req.body;

  if (!titulo || !descricao || !categoria || !status || !ano || !autor) {
    return res.status(400).json({
      erro: "Dados obrigatórios ausentes."
    });
  }

  const ultimoLivro = await livrosCollection()
    .find({}, { projection: { _id: 0, id: 1 } })
    .sort({ id: -1 })
    .limit(1)
    .toArray();

  const proximoId = (ultimoLivro[0]?.id ?? 0) + 1;

  const novoLivro = {
    id: proximoId,
    titulo,
    descricao,
    categoria,
    status,
    autor,
    ano
  };

  await livrosCollection().insertOne(novoLivro);
  res.status(201).json(novoLivro);
});

app.delete("/api/livros/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  const resultado = await livrosCollection().deleteOne({ id });

  if (resultado.deletedCount === 0) {
    return res.status(404).json({
      erro: "Livro não encontrado."
    });
  }

  res.status(204).send();
});

const PORT = Number(process.env.PORT) || 3000;

await conectarBanco();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API em http://localhost:${PORT}`);
});