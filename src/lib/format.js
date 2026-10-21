// Formatação de datas, durações e textos. Funções puras (testadas em tests/).

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-10-14" -> Date local (sem deslocar o dia por fuso). */
export function parseData(iso) {
  const [a, m, d] = String(iso).split("-").map(Number);
  return new Date(a, (m || 1) - 1, d || 1);
}

export function dataCurta(iso) {
  const d = parseData(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function dataLonga(iso) {
  const d = parseData(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "2026-10" -> "outubro de 2026" */
export function nomeMes(chave) {
  const [a, m] = chave.split("-").map(Number);
  return `${MESES[m - 1]} de ${a}`;
}

/** "1:02:03" | "02:03" | 123 -> segundos */
export function paraSegundos(t) {
  if (typeof t === "number") return t;
  return String(t).split(":").map(Number).reduce((acc, n) => acc * 60 + n, 0);
}

/** segundos -> "1:02:03" ou "2:03" */
export function tempo(seg) {
  seg = Math.max(0, Math.floor(seg || 0));
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = seg % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return (h ? h + ":" : "") + mm + ":" + String(s).padStart(2, "0");
}

/** Remove acentos e caixa para comparar textos. */
export function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function slugify(texto) {
  return normalizar(texto).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
