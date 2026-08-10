import { getPool, ensureTable, rowToAthlete, calcAge } from "../lib/db.js";

export default async function handler(req, res) {
  try {
    await ensureTable();
    const pool = getPool();

    if (req.method === "GET") {
      const { rows } = await pool.query("SELECT * FROM athletes ORDER BY nome ASC");
      return res.status(200).json(rows.map(rowToAthlete));
    }

    if (req.method === "POST") {
      const a = req.body || {};
      const { rows: existing } = await pool.query("SELECT id FROM athletes");
      const nextNum =
        existing.reduce((max, r) => {
          const n = parseInt(String(r.id).replace("ATL-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0) + 1;
      const id = `ATL-${String(nextNum).padStart(3, "0")}`;
      const idade = calcAge(a.nascimento);

      const { rows } = await pool.query(
        `INSERT INTO athletes
          (id, nome, nascimento, idade, posicao, posicao_secundaria, pe, clube, nacionalidade, status, video, relatorio, observacoes, ultima_analise, analista)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [
          id,
          a.nome || "",
          a.nascimento || null,
          idade,
          a.posicao || null,
          a.posicaoSecundaria && a.posicaoSecundaria !== "—" ? a.posicaoSecundaria : null,
          a.pe || null,
          a.clube || "",
          a.nacionalidade || "",
          a.status || "Monitorado",
          a.video || "",
          a.relatorio || "",
          a.observacoes || "",
          a.ultimaAnalise || null,
          a.analista || "",
        ]
      );
      return res.status(201).json(rowToAthlete(rows[0]));
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method not allowed");
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
