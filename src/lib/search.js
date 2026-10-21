// Busca e filtros sobre as publicações. Funções puras (testadas em tests/).
import { normalizar, parseData } from "./format.js";

/** Texto pesquisável de uma publicação (título pesa mais que o resto). */
function camposDe(item) {
  return {
    titulo: normalizar(item.titulo),
    resto: normalizar([item.descricao, item.categoria, (item.tags || []).join(" "), item.autor, item.textoBusca].join(" ")),
  };
}

/**
 * Pontua itens para a consulta. Todos os termos precisam aparecer (no título ou no resto).
 * Retorna os itens encontrados, mais relevantes primeiro, e por data em caso de empate.
 */
export function buscar(itens, consulta) {
  const termos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!termos.length) return itens.slice();
  const achados = [];
  for (const item of itens) {
    const { titulo, resto } = camposDe(item);
    let pontos = 0;
    const todos = termos.every(t => {
      if (titulo.includes(t)) { pontos += titulo.startsWith(t) ? 6 : 4; return true; }
      if (resto.includes(t)) { pontos += 1; return true; }
      return false;
    });
    if (todos) achados.push({ item, pontos });
  }
  return achados
    .sort((a, b) => b.pontos - a.pontos || String(b.item.data).localeCompare(String(a.item.data)))
    .map(a => a.item);
}

/**
 * filtros: { categoria, tag, periodo: "todos" | "7" | "30" | "AAAA-MM", ordem: "recentes" | "antigos" }
 * hoje é injetável para os testes.
 */
export function filtrar(itens, filtros = {}, hoje = new Date()) {
  const { categoria, tag, periodo = "todos", ordem = "recentes" } = filtros;
  let lista = itens.filter(item => {
    if (categoria && item.categoria !== categoria) return false;
    if (tag && !(item.tags || []).includes(tag)) return false;
    if (periodo === "7" || periodo === "30") {
      const dias = (hoje - parseData(item.data)) / 86400000;
      if (dias > Number(periodo) || dias < -1) return false;
    } else if (/^\d{4}-\d{2}$/.test(periodo) && !String(item.data).startsWith(periodo)) {
      return false;
    }
    return true;
  });
  lista = lista.sort((a, b) => String(b.data).localeCompare(String(a.data)));
  return ordem === "antigos" ? lista.reverse() : lista;
}

/** Valores distintos para montar os filtros. */
export function opcoes(itens) {
  const categorias = [...new Set(itens.map(i => i.categoria).filter(Boolean))].sort();
  const contagem = {};
  for (const i of itens) for (const t of i.tags || []) contagem[t] = (contagem[t] || 0) + 1;
  const tags = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a] || a.localeCompare(b));
  const meses = [...new Set(itens.map(i => String(i.data).slice(0, 7)))].sort().reverse();
  return { categorias, tags, meses };
}
