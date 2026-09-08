import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  Search, X, ChevronDown, Play, FileText, Users, Eye, Star, Building2, Globe2,
  ArrowLeft, SlidersHorizontal, Calendar, Footprints, ShieldCheck, User, ClipboardList, Plus, Pencil, Trash2, Menu,
} from "lucide-react";

/* ============================== TOKENS ============================== */
const COLORS = {
  red: "#A9182A",
  redDark: "#7E1120",
  redSoft: "#F4DADD",
  ink: "#16171A",
  graphite: "#2B2D33",
  slate: "#5B5E68",
  line: "#E4E4E7",
  paper: "#FAFAFA",
  white: "#FFFFFF",
  // Right side (main content) is now black — dark theme tokens
  mainBg: "#0C0C0E",
  card: "#1A1B1F",
  borderDark: "#2C2D33",
  textLight: "#F5F5F6",
  mutedLight: "#9A9DA6",
};

const POSITIONS = ["GOL", "LD", "LE", "ZAG", "VOL", "MED", "MEI", "EXT", "CA"];
const POSITION_LABELS = {
  GOL: "Goleiro", LD: "Lateral Direito", LE: "Lateral Esquerdo", ZAG: "Zagueiro",
  VOL: "Volante", MED: "Médio", MEI: "Meia", EXT: "Extremo", CA: "Centroavante",
};
const FEET = ["Direito", "Esquerdo", "Ambidestro"];
const STATUSES = ["Monitorado", "Prioridade", "Recomendado", "Aprovado", "Descartado"];
const STATUS_ORDER = ["Monitorado", "Prioridade", "Recomendado", "Aprovado"];

const STATUS_STYLE = {
  "Monitorado":  { bg: "#EEEEF0", fg: COLORS.graphite, dot: "#5B5E68" },
  "Prioridade":  { bg: COLORS.red, fg: COLORS.white,  dot: COLORS.white },
  "Recomendado": { bg: "#DCEEE1", fg: "#1F6B3D",      dot: "#2E8B57" },
  "Aprovado":    { bg: "#1F6B3D", fg: COLORS.white,   dot: COLORS.white },
  "Descartado":  { bg: "#F1F1F2", fg: "#A6A8AE",     dot: "#C7C8CD" },
};

/* ============================== SAMPLE DATA ============================== */
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
    const year = 2006 + Math.floor(rnd() * 10); // 2006-2015
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 28);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    const status = pick(STATUSES);
    const hasVideo = rnd() > 0.15;
    const hasReport = rnd() > 0.25;
    list.push({
      id: `ATL-${String(i).padStart(3, "0")}`,
      nome: `${pick(FIRST)} ${pick(LAST)}`,
      nascimento: birth.toISOString().slice(0, 10),
      idade: age,
      posicao: pos,
      posicaoSecundaria: rnd() > 0.5 ? pick(POSITIONS.filter((p) => p !== pos)) : "—",
      pe: pick(FEET),
      clube: pick(CLUBS),
      nacionalidade: pick(NATIONS),
      status,
      video: hasVideo ? "https://video.example.com/clip" : "",
      relatorio: hasReport ? "https://relatorio.example.com/doc" : "",
      observacoes: pick(OBS),
      ultimaAnalise: new Date(2026, Math.floor(rnd() * 8), 1 + Math.floor(rnd() * 27)).toISOString().slice(0, 10),
      analista: pick(ANALYSTS),
    });
  }
  return list;
}

/* ============================== HELPERS ============================== */
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function calcAge(iso) {
  if (!iso) return "";
  const birth = new Date(iso);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function StatusBadge({ status, size = "sm" }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE["Monitorado"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"}`}
      style={{ backgroundColor: st.bg, color: st.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
      {status}
    </span>
  );
}

/* ============================== SHIELD ============================== */
const CREST_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFACAMAAAD6TlWYAAADAFBMVEVHcEztHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCT/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gD/8gDtHCT/8gD/8gD/8gD/8gD/8gDtHCT/8gD/8gD/8gDtHCT/8gD/8gD/8gD/8gD/8gD/8gD/8gDtHCTtHCT/8gD/8gD/8gD/8gD/8gDtHCT/8gD/8gD/8gD/8gDtHCT/8gD/8gDtHCT/8gD/8gD/8gD/8gDtHCTtHCTtHCT/8gDtHCT/8gD/8gD/8gD/8gDtHCT/8gD/8gD/8gD/8gDtHCT/8gD/8gDtHCTtHCTtHCT/8gDtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCTtHCQqINQdAAABAHRSTlMAkv75+34CoPfy7lSW/4Op/VqXgAOrWJn8V6ybe66cnXkEr3exUg0kUR5nARVbudg7dHHciC5jz70XBrX6TsvmOKaLlAq/+EZg6pBWfxsP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";

function Shield({ size = 40 }) {
  return (
    <img
      src={CREST_DATA_URI}
      alt="Escudo do Esporte Clube Noroeste"
      style={{ width: size, height: "auto", maxHeight: size * 1.14, objectFit: "contain" }}
    />
  );
}

/* ============================== MAIN APP ============================== */
export default function App() {
  const [athletes, setAthletes] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState("overview"); // overview | database | profile
  const [selectedId, setSelectedId] = useState(null);

  const [filters, setFilters] = useState({
    nome: "", ano: "", faixa: "", posicao: "", pe: "", clube: "", nacionalidade: "", status: "", analista: "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortKey, setSortKey] = useState("nome");
  const [sortDir, setSortDir] = useState("asc");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState(null); // null = novo atleta
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



  const [loadError, setLoadError] = useState(null);

  // Carrega do banco de dados (API) e semeia dados de exemplo se estiver vazio
  useEffect(() => {
    (async () => {
      try {
        let res = await fetch("/api/athletes");
        if (!res.ok) throw new Error(`Erro ao carregar (status ${res.status})`);
        let data = await res.json();
        if (data.length === 0) {
          await fetch("/api/seed", { method: "POST" });
          res = await fetch("/api/athletes");
          data = await res.json();
        }
        setAthletes(data);
      } catch (e) {
        setLoadError(e.message);
        setAthletes([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const clearFilters = () => setFilters({
    nome: "", ano: "", faixa: "", posicao: "", pe: "", clube: "", nacionalidade: "", status: "", analista: "",
  });

  const filtered = useMemo(() => {
    if (!athletes) return [];
    return athletes.filter((a) => {
      if (filters.nome && !a.nome.toLowerCase().includes(filters.nome.toLowerCase())) return false;
      if (filters.ano && a.nascimento.slice(0, 4) !== filters.ano) return false;
      if (filters.faixa) {
        const [min, max] = filters.faixa.split("-").map(Number);
        if (a.idade < min || a.idade > max) return false;
      }
      if (filters.posicao && a.posicao !== filters.posicao) return false;
      if (filters.pe && a.pe !== filters.pe) return false;
      if (filters.clube && a.clube !== filters.clube) return false;
      if (filters.nacionalidade && a.nacionalidade !== filters.nacionalidade) return false;
      if (filters.status && a.status !== filters.status) return false;
      if (filters.analista && a.analista !== filters.analista) return false;
      return true;
    });
  }, [athletes, filters]);

  const searched = useMemo(() => {
    let list = filtered;
    if (search) list = list.filter((a) => a.nome.toLowerCase().includes(search.toLowerCase()));
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
  }, [filtered, search, sortKey, sortDir]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clubOptions = useMemo(() => athletes ? [...new Set(athletes.map((a) => a.clube))].sort() : [], [athletes]);
  const nationOptions = useMemo(() => athletes ? [...new Set(athletes.map((a) => a.nacionalidade))].sort() : [], [athletes]);
  const analystOptions = useMemo(() => athletes ? [...new Set(athletes.map((a) => a.analista))].sort() : [], [athletes]);
  const yearOptions = useMemo(() => athletes ? [...new Set(athletes.map((a) => a.nascimento.slice(0, 4)))].sort() : [], [athletes]);

  const selected = useMemo(() => athletes ? athletes.find((a) => a.id === selectedId) : null, [athletes, selectedId]);

  const openProfile = (id) => { setSelectedId(id); setPage("profile"); };

  const openNewForm = () => { setEditingAthlete(null); setFormOpen(true); };
  const openEditForm = (athlete) => { setEditingAthlete(athlete); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingAthlete(null); };

  const saveAthlete = async (data) => {
    try {
      if (editingAthlete) {
        const res = await fetch(`/api/athletes/${editingAthlete.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Não foi possível salvar as alterações.");
        const updated = await res.json();
        setAthletes((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const res = await fetch("/api/athletes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Não foi possível adicionar o atleta.");
        const created = await res.json();
        setAthletes((list) => [created, ...list]);
        setSelectedId(created.id);
      }
      closeForm();
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteAthlete = async (id) => {
    try {
      const res = await fetch(`/api/athletes/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Não foi possível remover o atleta.");
      setAthletes((list) => list.filter((a) => a.id !== id));
      if (selectedId === id) { setSelectedId(null); setPage("database"); }
    } catch (e) {
      alert(e.message);
    }
  };

  if (!loaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.mainBg }}>
        <div className="flex flex-col items-center gap-3">
          <Shield size={88} />
          <span style={{ color: COLORS.mutedLight, fontFamily: "Inter, sans-serif" }} className="text-sm">Carregando banco de atletas…</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center px-6" style={{ backgroundColor: COLORS.mainBg }}>
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <Shield size={64} />
          <span className="font-display text-lg" style={{ color: COLORS.textLight }}>Banco de dados não conectado</span>
          <span style={{ color: COLORS.mutedLight, fontFamily: "Inter, sans-serif" }} className="text-sm">{loadError}</span>
        </div>
      </div>
    );
  }

  if (!athletes) {
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: COLORS.mainBg, fontFamily: "Inter, sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #D8D8DB; border-radius: 8px; }
      `}</style>

      {/* ============ MOBILE TOP BAR ============ */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: COLORS.white, borderColor: COLORS.line }}>
        <div className="flex items-center gap-2.5">
          <Shield size={32} />
          <div>
            <div className="font-display text-[12px] tracking-wide leading-tight" style={{ color: COLORS.ink }}>ESPORTE CLUBE NOROESTE</div>
            <div className="text-[9px] tracking-wider" style={{ color: COLORS.slate }}>DEPTO. DE MERCADO</div>
          </div>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg border" style={{ borderColor: COLORS.line, color: COLORS.graphite }}>
          <Menu size={18} />
        </button>
      </div>

      {/* Overlay behind mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`w-64 md:w-60 shrink-0 flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-200 md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: COLORS.white, borderRight: `1px solid ${COLORS.line}` }}
      >
        <div className="px-5 py-6 flex flex-col items-center text-center gap-2 border-b relative" style={{ borderColor: COLORS.line }}>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute right-3 top-3 p-1" style={{ color: COLORS.slate }}>
            <X size={18} />
          </button>
          <Shield size={92} />
          <div>
            <div className="font-display text-[13px] tracking-wide leading-tight" style={{ color: COLORS.ink }}>ESPORTE CLUBE NOROESTE</div>
            <div className="text-[10px] tracking-wider mt-0.5" style={{ color: COLORS.slate }}>DEPTO. DE MERCADO</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <SidebarLink icon={<Eye size={16} />} label="VISÃO GERAL" active={page === "overview"} onClick={() => { setPage("overview"); setMobileMenuOpen(false); }} />
          <SidebarLink icon={<Users size={16} />} label="BANCO DE ATLETAS" active={page === "database" || page === "profile"} onClick={() => { setPage("database"); setMobileMenuOpen(false); }} />
        </nav>
        <div className="px-5 py-4 text-[11px] border-t" style={{ borderColor: COLORS.line, color: COLORS.slate }}>
          Categorias de Base · Bauru-SP
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 md:px-8 py-4 md:py-5 border-b flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between" style={{ borderColor: COLORS.borderDark, backgroundColor: COLORS.card }}>
          <div>
            <div className="hidden md:block text-[11px] tracking-widest font-semibold" style={{ color: COLORS.red }}>ESPORTE CLUBE NOROESTE</div>
            <h1 className="font-display text-lg md:text-xl leading-tight" style={{ color: COLORS.textLight }}>Departamento de Mercado — Categorias de Base</h1>
            <div className="text-xs mt-0.5" style={{ color: COLORS.mutedLight }}>Banco de Atletas Mapeados</div>
          </div>
          {page !== "overview" && page !== "profile" && (
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.mutedLight }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar atleta por nome…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none border focus:ring-2"
                style={{ borderColor: COLORS.borderDark, backgroundColor: COLORS.mainBg, color: COLORS.textLight }}
              />
            </div>
          )}
          {page === "profile" && (
            <button onClick={() => setPage("database")} className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border hover:opacity-80 self-start" style={{ borderColor: COLORS.borderDark, color: COLORS.textLight }}>
              <ArrowLeft size={15} /> Voltar ao banco
            </button>
          )}
        </header>

        {/* Filters bar (overview + database) */}
        {(page === "overview" || page === "database") && (
          <FiltersBar
            filters={filters} setFilters={setFilters} clear={clearFilters}
            open={filtersOpen} setOpen={setFiltersOpen}
            clubOptions={clubOptions} nationOptions={nationOptions} analystOptions={analystOptions} yearOptions={yearOptions}
            activeCount={activeFilterCount}
          />
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-5 md:py-6">
          {page === "overview" && <Overview data={filtered} onOpen={openProfile} />}
          {page === "database" && (
            <DatabaseTable
              data={searched} sortKey={sortKey} sortDir={sortDir}
              setSortKey={setSortKey} setSortDir={setSortDir} onOpen={openProfile}
              onAdd={openNewForm}
            />
          )}
          {page === "profile" && selected && (
            <Profile athlete={selected} onEdit={() => openEditForm(selected)} onDelete={() => deleteAthlete(selected.id)} />
          )}
        </main>
      </div>

      {formOpen && (
        <AthleteFormModal athlete={editingAthlete} onSave={saveAthlete} onClose={closeForm} />
      )}
    </div>
  );
}

/* ============================== SIDEBAR LINK ============================== */
function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? COLORS.red : "transparent",
        color: active ? COLORS.white : COLORS.graphite,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ============================== FILTERS BAR ============================== */
function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-2 text-xs rounded-lg border outline-none cursor-pointer"
        style={{ borderColor: COLORS.borderDark, backgroundColor: COLORS.mainBg, color: COLORS.textLight, minWidth: 120 }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.mutedLight }} />
    </div>
  );
}

function FiltersBar({ filters, setFilters, clear, open, setOpen, clubOptions, nationOptions, analystOptions, yearOptions, activeCount }) {
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  return (
    <div className="px-8 py-3 border-b" style={{ borderColor: COLORS.borderDark, backgroundColor: COLORS.card }}>
      <div className="flex items-center justify-between">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-xs font-semibold" style={{ color: COLORS.textLight }}>
          <SlidersHorizontal size={14} style={{ color: COLORS.red }} />
          FILTROS {activeCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: COLORS.red }}>{activeCount}</span>}
          <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {activeCount > 0 && (
          <button onClick={clear} className="flex items-center gap-1 text-xs font-medium" style={{ color: COLORS.mutedLight }}>
            <X size={13} /> Limpar filtros
          </button>
        )}
      </div>
      {open && (
        <div className="flex flex-wrap gap-2 mt-3">
          <input value={filters.nome} onChange={(e) => set("nome")(e.target.value)} placeholder="Nome do atleta"
            className="px-3 py-2 text-xs rounded-lg border outline-none" style={{ borderColor: COLORS.borderDark, backgroundColor: COLORS.mainBg, color: COLORS.textLight, minWidth: 140 }} />
          <Select value={filters.ano} onChange={set("ano")} options={yearOptions} placeholder="Ano de nascimento" />
          <Select value={filters.faixa} onChange={set("faixa")} placeholder="Faixa etária"
            options={[{ value: "12-15", label: "12–15 anos" }, { value: "16-18", label: "16–18 anos" }, { value: "19-21", label: "19–21 anos" }]} />
          <Select value={filters.posicao} onChange={set("posicao")} options={POSITIONS.map((p) => ({ value: p, label: `${p} — ${POSITION_LABELS[p]}` }))} placeholder="Posição" />
          <Select value={filters.pe} onChange={set("pe")} options={FEET} placeholder="Pé preferido" />
          <Select value={filters.clube} onChange={set("clube")} options={clubOptions} placeholder="Clube" />
          <Select value={filters.nacionalidade} onChange={set("nacionalidade")} options={nationOptions} placeholder="Nacionalidade" />
          <Select value={filters.status} onChange={set("status")} options={STATUSES} placeholder="Status" />
          <Select value={filters.analista} onChange={set("analista")} options={analystOptions} placeholder="Analista responsável" />
        </div>
      )}
    </div>
  );
}

/* ============================== KPI CARD ============================== */
function KpiCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border p-4 flex items-center gap-3" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark, borderLeft: `3px solid ${COLORS.red}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: COLORS.redSoft, color: COLORS.red }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-display text-2xl leading-none" style={{ color: COLORS.textLight }}>{value}</div>
        <div className="text-[11px] mt-1 truncate" style={{ color: COLORS.mutedLight }}>{label}</div>
      </div>
    </div>
  );
}

/* ============================== OVERVIEW ============================== */
function Overview({ data, onOpen }) {
  const total = data.length;
  const monitorados = data.filter((a) => a.status === "Monitorado").length;
  const prioridade = data.filter((a) => a.status === "Prioridade").length;
  const recomendados = data.filter((a) => a.status === "Recomendado").length;
  const aprovados = data.filter((a) => a.status === "Aprovado").length;
  const descartados = data.filter((a) => a.status === "Descartado").length;
  const clubes = new Set(data.map((a) => a.clube)).size;
  const nacoes = new Set(data.map((a) => a.nacionalidade)).size;

  const byPosition = POSITIONS.map((p) => ({ name: p, value: data.filter((a) => a.posicao === p).length }));
  const byYear = useMemo(() => {
    const years = [...new Set(data.map((a) => a.nascimento.slice(0, 4)))].sort();
    return years.map((y) => ({ name: y, value: data.filter((a) => a.nascimento.slice(0, 4) === y).length }));
  }, [data]);
  const byStatus = STATUS_ORDER.concat(["Descartado"]).map((s) => ({ name: s, value: data.filter((a) => a.status === s).length }));
  const byNation = useMemo(() => {
    const nations = [...new Set(data.map((a) => a.nacionalidade))];
    return nations.map((n) => ({ name: n, value: data.filter((a) => a.nacionalidade === n).length }))
      .sort((a, b) => b.value - a.value);
  }, [data]);
  const priorityAthletes = data.filter((a) => a.status === "Prioridade").slice(0, 5);
  const recommendedAthletes = data.filter((a) => a.status === "Recomendado").slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="Atletas mapeados" value={total} icon={<Users size={16} />} />
        <KpiCard label="Monitorados" value={monitorados} icon={<Eye size={16} />} />
        <KpiCard label="Prioridade" value={prioridade} icon={<Star size={16} />} />
        <KpiCard label="Recomendados" value={recomendados} icon={<ShieldCheck size={16} />} />
        <KpiCard label="Aprovados" value={aprovados} icon={<ShieldCheck size={16} />} />
        <KpiCard label="Descartados" value={descartados} icon={<X size={16} />} />
        <KpiCard label="Clubes monitorados" value={clubes} icon={<Building2 size={16} />} />
        <KpiCard label="Nacionalidades" value={nacoes} icon={<Globe2 size={16} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Atletas por posição">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPosition} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.borderDark} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.mutedLight }} axisLine={{ stroke: COLORS.borderDark }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.mutedLight }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#A9182A22" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.borderDark}`, backgroundColor: COLORS.mainBg, color: COLORS.textLight }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={COLORS.red} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Atletas por ano de nascimento">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byYear} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={COLORS.borderDark} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLORS.mutedLight }} axisLine={{ stroke: COLORS.borderDark }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.mutedLight }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#F5F5F611" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.borderDark}`, backgroundColor: COLORS.mainBg, color: COLORS.textLight }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={COLORS.mutedLight} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Atletas por status">
          <div className="flex flex-col gap-2.5 pt-1">
            {byStatus.map((s) => {
              const max = Math.max(...byStatus.map((x) => x.value), 1);
              const st = STATUS_STYLE[s.name];
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-24 text-[11px] shrink-0" style={{ color: COLORS.mutedLight }}>{s.name}</div>
                  <div className="flex-1 h-2.5 rounded-full" style={{ backgroundColor: COLORS.borderDark }}>
                    <div className="h-2.5 rounded-full" style={{ width: `${(s.value / max) * 100}%`, backgroundColor: st.dot === COLORS.white ? COLORS.red : st.dot }} />
                  </div>
                  <div className="w-5 text-[11px] font-mono text-right" style={{ color: COLORS.textLight }}>{s.value}</div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Atletas por nacionalidade">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byNation} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke={COLORS.borderDark} />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.mutedLight }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: COLORS.textLight }} axisLine={false} tickLine={false} width={80} />
              <Tooltip cursor={{ fill: "#A9182A22" }} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.borderDark}`, backgroundColor: COLORS.mainBg, color: COLORS.textLight }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={COLORS.red} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Prioridades atuais">
          <AthleteMiniList
            athletes={priorityAthletes}
            emptyText="Nenhum atleta classificado como prioridade no momento."
            onOpen={onOpen}
          />
        </ChartCard>

        <ChartCard title="Recomendados atuais">
          <AthleteMiniList
            athletes={recommendedAthletes}
            emptyText="Nenhum atleta classificado como recomendado no momento."
            onOpen={onOpen}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function AthleteMiniList({ athletes, emptyText, onOpen }) {
  if (athletes.length === 0) {
    return <div className="text-xs py-6 text-center" style={{ color: COLORS.mutedLight }}>{emptyText}</div>;
  }
  return (
    <div className="flex flex-col gap-1">
      {athletes.map((a, i) => (
        <button key={a.id} onClick={() => onOpen(a.id)} className="flex items-center justify-between py-2 px-1 text-left hover:opacity-80 rounded-lg"
          style={{ borderBottom: i < athletes.length - 1 ? `1px solid ${COLORS.borderDark}` : "none" }}>
          <div>
            <div className="text-sm font-medium" style={{ color: COLORS.textLight }}>{a.nome}</div>
            <div className="text-[11px]" style={{ color: COLORS.mutedLight }}>{POSITION_LABELS[a.posicao]} · {a.clube}</div>
          </div>
          <StatusBadge status={a.status} />
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
      <div className="text-xs font-semibold tracking-wide mb-3" style={{ color: COLORS.textLight }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

/* ============================== DATABASE TABLE ============================== */
const COLUMNS = [
  { key: "nome", label: "Atleta" },
  { key: "idade", label: "Idade" },
  { key: "nascimento", label: "Nascimento" },
  { key: "posicao", label: "Posição" },
  { key: "pe", label: "Pé" },
  { key: "clube", label: "Clube" },
  { key: "nacionalidade", label: "Nacionalidade" },
  { key: "status", label: "Status" },
];

function DatabaseTable({ data, sortKey, sortDir, setSortKey, setSortDir, onOpen, onAdd }) {
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
      <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: COLORS.borderDark }}>
        <span className="text-xs font-semibold" style={{ color: COLORS.textLight }}>{data.length} ATLETA{data.length !== 1 ? "S" : ""} ENCONTRADO{data.length !== 1 ? "S" : ""}</span>
        <button onClick={onAdd} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: COLORS.red }}>
          <Plus size={13} /> ADICIONAR ATLETA
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: COLORS.mainBg }}>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}
                  className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide cursor-pointer select-none whitespace-nowrap"
                  style={{ color: COLORS.mutedLight }}>
                  {c.label.toUpperCase()} {sortKey === c.key && (sortDir === "asc" ? "↑" : "↓")}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide" style={{ color: COLORS.mutedLight }}>VÍDEO</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-wide" style={{ color: COLORS.mutedLight }}>RELATÓRIO</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} onClick={() => onOpen(a.id)} className="cursor-pointer hover:opacity-90 transition-colors" style={{ borderTop: `1px solid ${COLORS.borderDark}` }}>
                <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: COLORS.textLight }}>{a.nome}</td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: COLORS.mutedLight }}>{a.idade}</td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: COLORS.mutedLight }}>{formatDate(a.nascimento)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: COLORS.borderDark, color: COLORS.textLight }}>{a.posicao}</span>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: COLORS.mutedLight }}>{a.pe}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: COLORS.mutedLight }}>{a.clube}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: COLORS.mutedLight }}>{a.nacionalidade}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  {a.video ? (
                    <a href={a.video} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded" style={{ color: COLORS.red, backgroundColor: COLORS.redSoft }}>
                      <Play size={11} fill={COLORS.red} /> VÍDEO
                    </a>
                  ) : <span className="text-[11px]" style={{ color: COLORS.borderDark }}>—</span>}
                </td>
                <td className="px-4 py-3">
                  {a.relatorio ? (
                    <a href={a.relatorio} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded border" style={{ color: COLORS.textLight, borderColor: COLORS.borderDark }}>
                      <FileText size={11} /> RELATÓRIO
                    </a>
                  ) : <span className="text-[11px]" style={{ color: COLORS.borderDark }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: COLORS.mutedLight }}>Nenhum atleta encontrado com os filtros aplicados.</div>
        )}
      </div>
    </div>
  );
}

/* ============================== PROFILE ============================== */
function DataRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${COLORS.borderDark}` }}>
      <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.mutedLight }}>{icon}{label}</div>
      <div className="text-sm font-medium" style={{ color: COLORS.textLight }}>{value}</div>
    </div>
  );
}

function Profile({ athlete: a, onEdit, onDelete }) {
  const stageIndex = STATUS_ORDER.indexOf(a.status);
  const isDescartado = a.status === "Descartado";
  return (
    <div className="flex flex-col gap-5 max-w-4xl w-full">
      {/* Header banner */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: COLORS.borderDark }}>
        <div className="px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4" style={{ backgroundColor: COLORS.card }}>
          <div>
            <div className="text-[10px] tracking-widest font-semibold" style={{ color: COLORS.mutedLight }}>{a.id}</div>
            <h2 className="font-display text-2xl mt-0.5" style={{ color: COLORS.textLight }}>{a.nome.toUpperCase()}</h2>
            <div className="text-sm mt-1" style={{ color: COLORS.mutedLight }}>
              {POSITION_LABELS[a.posicao]} · {a.nascimento.slice(0, 4)} · {a.clube}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border hover:opacity-80" style={{ borderColor: COLORS.borderDark, color: COLORS.textLight }}>
              <Pencil size={13} /> EDITAR
            </button>
            <button onClick={() => { if (window.confirm(`Remover ${a.nome} do banco de atletas?`)) onDelete(); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border hover:opacity-80" style={{ borderColor: COLORS.borderDark, color: COLORS.red }}>
              <Trash2 size={13} /> EXCLUIR
            </button>
          </div>
        </div>
        <div className="h-1" style={{ backgroundColor: COLORS.red }} />
      </div>

      {/* Pipeline */}
      <div className="rounded-xl border p-5" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
        <div className="text-xs font-semibold tracking-wide mb-4" style={{ color: COLORS.textLight }}>ESTÁGIO NO PROCESSO DE SCOUTING</div>
        {isDescartado ? (
          <StatusBadge status="Descartado" size="lg" />
        ) : (
          <div className="flex items-center">
            {STATUS_ORDER.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i <= stageIndex ? COLORS.red : COLORS.borderDark }} />
                  <span className="text-[10px] whitespace-nowrap" style={{ color: i <= stageIndex ? COLORS.textLight : COLORS.mutedLight, fontWeight: i === stageIndex ? 700 : 500 }}>{s}</span>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div className="flex-1 h-[2px] mx-1 mb-4" style={{ backgroundColor: i < stageIndex ? COLORS.red : COLORS.borderDark }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dados do atleta */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
          <div className="text-xs font-semibold tracking-wide mb-2 flex items-center gap-2" style={{ color: COLORS.textLight }}>
            <User size={14} style={{ color: COLORS.red }} /> DADOS DO ATLETA
          </div>
          <DataRow icon={<User size={13} />} label="Nome" value={a.nome} />
          <DataRow icon={<Calendar size={13} />} label="Data de nascimento" value={formatDate(a.nascimento)} />
          <DataRow icon={<Calendar size={13} />} label="Idade" value={`${a.idade} anos`} />
          <DataRow icon={<Globe2 size={13} />} label="Nacionalidade" value={a.nacionalidade} />
          <DataRow icon={<Building2 size={13} />} label="Clube atual" value={a.clube} />
          <DataRow icon={<ShieldCheck size={13} />} label="Posição principal" value={`${a.posicao} — ${POSITION_LABELS[a.posicao]}`} />
          <DataRow icon={<ShieldCheck size={13} />} label="Posição secundária" value={a.posicaoSecundaria === "—" ? "—" : `${a.posicaoSecundaria} — ${POSITION_LABELS[a.posicaoSecundaria]}`} />
          <DataRow icon={<Footprints size={13} />} label="Pé preferido" value={a.pe} />
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.mutedLight }}><ClipboardList size={13} />Status atual</div>
            <StatusBadge status={a.status} />
          </div>
        </div>

        {/* Material + acompanhamento */}
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border p-5" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
            <div className="text-xs font-semibold tracking-wide mb-3" style={{ color: COLORS.textLight }}>MATERIAL DE SCOUTING</div>
            <div className="flex flex-col gap-2.5">
              <a href={a.video || undefined} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-opacity"
                style={{ backgroundColor: a.video ? COLORS.red : COLORS.borderDark, pointerEvents: a.video ? "auto" : "none" }}>
                <Play size={15} fill="#fff" /> ASSISTIR VÍDEO
              </a>
              <a href={a.relatorio || undefined} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold border transition-colors"
                style={{ borderColor: a.relatorio ? COLORS.textLight : COLORS.borderDark, color: a.relatorio ? COLORS.textLight : COLORS.mutedLight, pointerEvents: a.relatorio ? "auto" : "none" }}>
                <FileText size={15} /> ABRIR RELATÓRIO
              </a>
              {(!a.video || !a.relatorio) && (
                <div className="text-[11px] text-center" style={{ color: COLORS.mutedLight }}>
                  {!a.video && !a.relatorio ? "Vídeo e relatório ainda não cadastrados." : !a.video ? "Vídeo ainda não cadastrado." : "Relatório ainda não cadastrado."}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border p-5 flex-1" style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
            <div className="text-xs font-semibold tracking-wide mb-3" style={{ color: COLORS.textLight }}>ACOMPANHAMENTO</div>
            <div className="text-sm leading-relaxed mb-4" style={{ color: COLORS.mutedLight }}>{a.observacoes}</div>
            <DataRow icon={<Calendar size={13} />} label="Última análise" value={formatDate(a.ultimaAnalise)} />
            <DataRow icon={<User size={13} />} label="Analista responsável" value={a.analista} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== ATHLETE FORM MODAL ============================== */
const EMPTY_FORM = {
  nome: "", nascimento: "", posicao: "GOL", posicaoSecundaria: "", pe: "Direito",
  clube: "", nacionalidade: "", status: "Monitorado", video: "", relatorio: "",
  observacoes: "", ultimaAnalise: "", analista: "",
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide" style={{ color: COLORS.mutedLight }}>{label.toUpperCase()}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  borderColor: COLORS.borderDark, backgroundColor: COLORS.mainBg, color: COLORS.textLight,
};

function AthleteFormModal({ athlete, onSave, onClose }) {
  const [form, setForm] = useState(() => athlete ? {
    nome: athlete.nome, nascimento: athlete.nascimento, posicao: athlete.posicao,
    posicaoSecundaria: athlete.posicaoSecundaria === "—" ? "" : athlete.posicaoSecundaria,
    pe: athlete.pe, clube: athlete.clube, nacionalidade: athlete.nacionalidade, status: athlete.status,
    video: athlete.video, relatorio: athlete.relatorio, observacoes: athlete.observacoes,
    ultimaAnalise: athlete.ultimaAnalise, analista: athlete.analista,
  } : EMPTY_FORM);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.nome.trim() && form.nascimento && form.clube.trim();

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({ ...form, posicaoSecundaria: form.posicaoSecundaria || "—" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-xl border"
        style={{ backgroundColor: COLORS.card, borderColor: COLORS.borderDark }}>
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: COLORS.borderDark }}>
          <h3 className="font-display text-lg" style={{ color: COLORS.textLight }}>
            {athlete ? "EDITAR ATLETA" : "ADICIONAR ATLETA"}
          </h3>
          <button type="button" onClick={onClose} style={{ color: COLORS.mutedLight }}><X size={18} /></button>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Nome completo">
            <input required value={form.nome} onChange={set("nome")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>
          <Field label="Data de nascimento">
            <input required type="date" value={form.nascimento} onChange={set("nascimento")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>

          <Field label="Posição principal">
            <select value={form.posicao} onChange={set("posicao")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p} — {POSITION_LABELS[p]}</option>)}
            </select>
          </Field>
          <Field label="Posição secundária">
            <select value={form.posicaoSecundaria} onChange={set("posicaoSecundaria")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle}>
              <option value="">—</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p} — {POSITION_LABELS[p]}</option>)}
            </select>
          </Field>

          <Field label="Pé preferido">
            <select value={form.pe} onChange={set("pe")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle}>
              {FEET.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set("status")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Clube atual">
            <input required value={form.clube} onChange={set("clube")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>
          <Field label="Nacionalidade">
            <input value={form.nacionalidade} onChange={set("nacionalidade")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>

          <Field label="Link do vídeo">
            <input value={form.video} onChange={set("video")} placeholder="https://…" className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>
          <Field label="Link do relatório">
            <input value={form.relatorio} onChange={set("relatorio")} placeholder="https://…" className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>

          <Field label="Última análise">
            <input type="date" value={form.ultimaAnalise} onChange={set("ultimaAnalise")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>
          <Field label="Analista responsável">
            <input value={form.analista} onChange={set("analista")} className="px-3 py-2 rounded-lg border outline-none" style={inputStyle} />
          </Field>

          <div className="col-span-2">
            <Field label="Observações">
              <textarea rows={3} value={form.observacoes} onChange={set("observacoes")} className="px-3 py-2 rounded-lg border outline-none resize-none" style={inputStyle} />
            </Field>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: COLORS.borderDark }}>
          <button type="button" onClick={onClose} className="text-sm font-medium px-4 py-2 rounded-lg border" style={{ borderColor: COLORS.borderDark, color: COLORS.textLight }}>
            Cancelar
          </button>
          <button type="submit" disabled={!valid} className="text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-40"
            style={{ backgroundColor: COLORS.red }}>
            {athlete ? "Salvar alterações" : "Adicionar atleta"}
          </button>
        </div>
      </form>
    </div>
  );
}
