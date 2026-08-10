import { getPool, ensureTable, rowToAthlete, calcAge } from "../lib/db.js";

const POSITIONS = ["GOL", "LD", "LE", "ZAG", "VOL", "MED", "MEI", "EXT", "CA"];
const FEET = ["Direito", "Esquerdo", "Ambidestro"];
const STATUSES = ["Monitorado", "Prioridade", "Descartado"];
const FIRST = ["João", "Pedro", "Lucas", "Gabriel", "Matheus", "Rafael", "Bruno", "Carlos", "Felipe", "André",
  "Thiago", "Diego", "Vitor", "Enzo", "Kaique", "Rian", "Miguel", "Igor", "Renan", "Yago", "Cauã", "Davi"];
const LAST = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira", "Rodrigues",
  "Carvalho", "Gomes", "Martins", "Araújo", "Ribeiro", "Barbosa", "Nascimento", "Teixeira", "Moreira", "Cardoso"];
const CLUBS = ["Santos FC", "Red Bull Bragantino", "Ponte Preta", "Guarani", "Botafogo-SP", "Ituano",
  "São Bento", "XV de Piracicaba", "Portuguesa", "Novorizontino", "Mirassol", "Inter de Bebedouro",
  "Corinthians", "Palmeiras", "São Paulo FC"];
const NATIONS = ["Brasil", "Brasil", "Brasil", "Brasil", "Argentina", "Paraguai", "Uruguai", "Brasil", "Brasil", "Portugal"];
const ANALYSTS = ["Rodrigo Malta", "Fernanda Costa", "Bruno Azevedo", "Camila Reis"];
const OBS = [
  "Boa leitura de jogo, precisa evoluir na força física.",
  "Excelente 1x1, decisivo nos últimos jogos observados.",
  "Passe curto muito preciso, participa pouco do jogo aéreo.",
  "Referência técnica na categoria, acompanhar evolução física.",
  "Jogador de projeção, ainda irregular em alguns jogos.",
  "Liderança em campo acima da média para a idade.",
  "Boa velocidade de deslocamento, finalização a aprimorar.",
  "Consistente defensivamente, atenção ao posicionamento em bolas aéreas.",
];

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const rnd = seededRand(42);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

function makeAthletes() {
  const list = [];
  for (let i = 1; i <= 24; i++) {
    const pos = pick(POSITIONS);
    const year = 2006 + Math.floor(rnd() * 10);
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 28);
    const birth = new Date(year, month - 1, day).toISOString().slice(0, 10);
    const hasVideo = rnd() > 0.15;
    const hasReport = rnd() > 0.25;
    list.push({
      id: `ATL-${String(i).padStart(3, "0")}`,
      nome: `${pick(FIRST)} ${pick(LAST)}`,
      nascimento: birth,
      idade: calcAge(birth),
      posicao: pos,
      posicaoSecundaria: rnd() > 0.5 ? pick(POSITIONS.filter((p) => p !== pos)) : null,
      pe: pick(FEET),
      clube: pick(CLUBS),
      nacionalidade: pick(NATIONS),
      status: pick(STATUSES),
      video: hasVideo ? "https://video.example.com/clip" : "",
      relatorio: hasReport ? "https://relatorio.example.com/doc" : "",
      observacoes: pick(OBS),
      ultimaAnalise: new Date(2026, Math.floor(rnd() * 8), 1 + Math.floor(rnd() * 27)).toISOString().slice(0, 10),
      analista: pick(ANALYSTS),
    });
  }
  return list;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method not allowed");
  }
  try {
    await ensureTable();
    const pool = getPool();
    const { rows: countRows } = await pool.query("SELECT COUNT(*)::int AS n FROM athletes");
    if (countRows[0].n > 0) {
      return res.status(200).json({ seeded: false, message: "Tabela já tem dados." });
    }
    const seed = makeAthletes();
    for (const a of seed) {
      await pool.query(
        `INSERT INTO athletes
          (id, nome, nascimento, idade, posicao, posicao_secundaria, pe, clube, nacionalidade, status, video, relatorio, observacoes, ultima_analise, analista)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [a.id, a.nome, a.nascimento, a.idade, a.posicao, a.posicaoSecundaria, a.pe, a.clube, a.nacionalidade,
          a.status, a.video, a.relatorio, a.observacoes, a.ultimaAnalise, a.analista]
      );
    }
    return res.status(200).json({ seeded: true, count: seed.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
