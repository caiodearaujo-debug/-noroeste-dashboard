import { getPool, ensureTable, rowToAthlete, calcAge } from "../../lib/db.js";

export default async function handler(req, res) {
  try {
    await ensureTable();
    const pool = getPool();
    const { id } = req.query;

    if (req.method === "PUT") {
      const a = req.body || {};
      const idade = calcAge(a.nascimento);
      const { rows } = await pool.query(
        `UPDATE athletes SET
          nome=$1, nascimento=$2, idade=$3, posicao=$4, posicao_secundaria=$5, pe=$6,
          clube=$7, nacionalidade=$8, status=$9, video=$10, relatorio=$11,
          observacoes=$12, ultima_analise=$13, analista=$14
         WHERE id=$15
         RETURNING *`,
        [
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
          id,
        ]
      );
      if (!rows[0]) return res.status(404).json({ error: "Atleta não encontrado" });
      return res.status(200).json(rowToAthlete(rows[0]));
    }

    if (req.method === "DELETE") {
      await pool.query("DELETE FROM athletes WHERE id=$1", [id]);
      return res.status(204).end();
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end("Method not allowed");
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
