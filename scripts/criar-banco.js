require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');

async function criarBanco() {
  const nome = process.env.DB_NAME;
  if (!nome || !/^[a-zA-Z0-9_]+$/.test(nome)) {
    throw new Error('DB_NAME deve conter apenas letras, números e sublinhado.');
  }
  const conexao = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  try {
    await conexao.query(`CREATE DATABASE IF NOT EXISTS \`${nome}\` CHARACTER SET utf8mb4`);
    console.log(`Banco ${nome} pronto.`);
  } finally {
    await conexao.end();
  }
}

criarBanco().catch((erro) => {
  console.error('Não foi possível criar o banco:', erro.code || erro.message);
  process.exitCode = 1;
});
