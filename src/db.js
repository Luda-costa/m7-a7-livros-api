import "dotenv/config";

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {

throw new Error(

"MONGODB_URI não configurada."

);

}

const client = new MongoClient(uri);

let collection;

export async function conectarBanco() {

await client.connect();

const db = client.db("m7-frontend");

collection = db.collection("livros");

await db.command({ ping: 1 });

console.log("MongoDB conectado.");

}

export function LivrosCollection() {

if (!collection) {

throw new Error("Banco não conectado.");

}

return collection;

}