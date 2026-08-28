import "dotenv/config";
import express from "express";
import cors from "cors";
import {
conectarBanco,
LivrosCollection
} from "./db.js";
const app = express();
app.use(cors());
app.use(express.json());

//rotas
app.get("/api/health", (_req, res) => {
res.json({status: "ok"});
});

app.get("/api/Livros", async (_req, res) => {
try {
const Livros =
await LivrosCollection()
.find(
{},
{ projection: { _id: 0 } }
)
.sort({ id: 1 })
.toArray();
res.json(Livros);
} catch {
res.status(500).json({
erro: "Erro ao listar Livros."
});
}
});

app.get("/api/Livros/:id", async (req, res) => {
const id = Number(req.params.id);
if (!Number.isFinite(id)) {
return res.status(400).json({
erro: "ID inválido."
});
}
const Livro =
await LivrosCollection().findOne(
{ id },
{ projection: { _id: 0 } }
);
if (!Livro) {
return res.status(404).json({
erro: "Livro não encontrado."
});
}
res.json(Livro);
});

app.post("/api/Livros", async (req, res) => {
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
const novoLivro = {
id: Date.now(),
titulo,
descricao,
categoria,
status,
autor,
criadoEm: new Date().toISOString().slice(0, 10)
};
await LivrosCollection().insertOne(novoLivro);
res.status(201).json(novoLivro);
});

const PORT =
Number(process.env.PORT) || 3000;
await conectarBanco();
app.listen(PORT, "0.0.0.0", () => {
console.log(`API em http://localhost:${PORT}`);
});