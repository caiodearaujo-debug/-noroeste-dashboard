import pg from "pg";

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
      throw new Error(
        "Nenhuma variável de ambiente de banco de dados encontrada (DATABASE_URL / POSTGRES_URL). Conecte um banco Neon ao projeto na aba Storage da Vercel."
      );
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

let tableReady = false;

export async function ensureTable() {
  if (tableReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS athletes (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      nascimento DATE,
      idade INTEGER,
      posicao TEXT,
      posicao_secundaria TEXT,
      pe TEXT,
      clube TEXT,
      nacionalidade TEXT,
      status TEXT,
      video TEXT,
      relatorio TEXT,
      observacoes TEXT,
      ultima_analise DATE,
      analista TEXT
    );
  `);
  tableReady = true;
}

export function rowToAthlete(row) {
  const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  return {
    id: row.id,
    nome: row.nome,
    nascimento: fmt(row.nascimento),
    idade: row.idade,
    posicao: row.posicao,
    posicaoSecundaria: row.posicao_secundaria || "—",
    pe: row.pe,
    clube: row.clube,
    nacionalidade: row.nacionalidade,
    status: row.status,
    video: row.video || "",
    relatorio: row.relatorio || "",
    observacoes: row.observacoes || "",
    ultimaAnalise: fmt(row.ultima_analise),
    analista: row.analista || "",
  };
}

export function calcAge(iso) {
  if (!iso) return null;
  const birth = new Date(iso);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
