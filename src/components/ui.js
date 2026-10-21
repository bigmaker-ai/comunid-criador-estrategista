// Peças de interface reutilizadas pelas páginas.
import { urlDe, COLECOES } from "../lib/data.js";
import { dataCurta, escapar, nomeMes } from "../lib/format.js";
import { opcoes } from "../lib/search.js";
import { icone } from "./icones.js";

const ICONE_COLECAO = { cortes: "tesoura", lives: "lista", whatsapp: "chat", comunidade: "pessoas" };

export const seloDemo = item => (item.demo ? `<span class="selo selo--demo" title="Conteúdo fictício de demonstração">Demonstração</span>` : "");

function capa(item, classe = "") {
  const src = item.miniatura ? urlDe(item.miniatura) : "";
  return src
    ? `<img class="${classe}" src="${escapar(src)}" alt="" loading="lazy" decoding="async">`
    : `<span class="${classe} capa-vazia" aria-hidden="true">${icone(ICONE_COLECAO[item.colecao] || "video")}</span>`;
}

/** Card com miniatura grande (cortes e vídeos da comunidade). */
export function cardVideo(item) {
  return `<article class="card card--video">
    <a class="card__link" href="${item.href}">
      <div class="card__capa">
        ${capa(item)}
        <span class="card__play" aria-hidden="true">${icone("play")}</span>
        ${item.duracao ? `<span class="card__duracao">${escapar(item.duracao)}</span>` : ""}
      </div>
      <div class="card__corpo">
        <div class="card__meta"><span class="chip">${escapar(item.categoria || "")}</span>${seloDemo(item)}</div>
        <h3 class="card__titulo">${escapar(item.titulo)}</h3>
        <p class="card__desc">${escapar(item.descricao || "")}</p>
        <div class="card__rodape">
          <time datetime="${escapar(item.data)}">${dataCurta(item.data)}</time>
          ${item.autor ? `<span>· por ${escapar(item.autor)}</span>` : ""}
        </div>
      </div>
    </a>
  </article>`;
}

/** Card de texto (resumos de lives e do WhatsApp). */
export function cardResumo(item) {
  const [a, m, d] = String(item.data).split("-");
  return `<article class="card card--resumo">
    <a class="card__link" href="${item.href}">
      <div class="card__data" aria-hidden="true"><strong>${d}</strong><span>${m}/${a.slice(2)}</span></div>
      <div class="card__corpo">
        <div class="card__meta"><span class="chip">${escapar(item.categoria || "")}</span>${seloDemo(item)}</div>
        <h3 class="card__titulo">${escapar(item.titulo)}</h3>
        <p class="card__desc">${escapar(item.descricao || "")}</p>
        ${item.tags?.length ? `<ul class="tags" aria-label="Tags">${item.tags.slice(0, 4).map(t => `<li>#${escapar(t)}</li>`).join("")}</ul>` : ""}
      </div>
      <span class="card__seta" aria-hidden="true">${icone("seta")}</span>
    </a>
  </article>`;
}

export function cardPara(item) {
  return item.colecao === "cortes" || item.colecao === "comunidade" ? cardVideo(item) : cardResumo(item);
}

/** Linha compacta para resultados de busca e relacionados. */
export function itemLista(item) {
  return `<li><a class="linha" href="${item.href}">
    <span class="linha__icone">${icone(ICONE_COLECAO[item.colecao])}</span>
    <span class="linha__texto"><small>${escapar(COLECOES[item.colecao].singular)} · ${dataCurta(item.data)}</small><strong>${escapar(item.titulo)}</strong></span>
    ${seloDemo(item)}
    <span class="linha__seta">${icone("seta")}</span>
  </a></li>`;
}

export function vazio({ titulo, texto, acao }) {
  return `<div class="vazio">
    <svg class="vazio__arte" viewBox="0 0 120 90" aria-hidden="true">
      <rect x="18" y="14" width="84" height="56" rx="6" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 6"/>
      <g fill="currentColor"><rect x="52" y="34" width="6" height="6"/><rect x="58" y="34" width="6" height="6"/><rect x="64" y="40" width="6" height="6"/><rect x="58" y="46" width="6" height="6"/><rect x="52" y="46" width="6" height="6"/><rect x="52" y="40" width="6" height="6"/></g>
      <rect x="40" y="76" width="40" height="5" rx="2.5" fill="currentColor" opacity=".35"/>
    </svg>
    <h3>${escapar(titulo)}</h3>
    <p>${escapar(texto)}</p>
    ${acao ? `<a class="botao botao--sec" href="${acao.href}">${escapar(acao.texto)}</a>` : ""}
  </div>`;
}

export function esqueleto(qtd = 6, tipo = "video") {
  return `<div class="grade grade--${tipo}" aria-busy="true" aria-label="Carregando">${
    Array.from({ length: qtd }, () => `<div class="card esqueleto"><div class="esqueleto__capa"></div><div class="esqueleto__linha"></div><div class="esqueleto__linha curta"></div></div>`).join("")
  }</div>`;
}

export function erro(e) {
  return vazio({ titulo: "Não foi possível carregar o conteúdo", texto: e?.message || "Tente recarregar a página.", acao: { href: "#/", texto: "Voltar ao início" } });
}

/** Cabeçalho de página de listagem. */
export function cabecalho({ eyebrow, titulo, texto, extra = "" }) {
  return `<section class="cabecalho">
    <p class="eyebrow">${escapar(eyebrow)}</p>
    <h1>${escapar(titulo)}</h1>
    ${texto ? `<p class="cabecalho__texto">${escapar(texto)}</p>` : ""}
    ${extra}
  </section>`;
}

/**
 * Barra de busca + filtros. estado: { q, categoria, tag, periodo, ordem }.
 * Chama aoMudar(novoEstado) a cada alteração.
 */
export function montarFiltros(alvo, itens, estado, aoMudar) {
  const { categorias, tags, meses } = opcoes(itens);
  alvo.innerHTML = `
    <div class="filtros" role="search">
      <label class="campo-busca">
        ${icone("busca")}
        <span class="sr">Buscar nesta página</span>
        <input type="search" name="q" placeholder="Buscar por título, assunto ou tag…" value="${escapar(estado.q || "")}" autocomplete="off">
      </label>
      <div class="filtros__selects">
        ${categorias.length > 1 ? `<label><span class="sr">Categoria</span><select name="categoria">
          <option value="">Todas as categorias</option>
          ${categorias.map(c => `<option ${c === estado.categoria ? "selected" : ""}>${escapar(c)}</option>`).join("")}
        </select></label>` : ""}
        <label><span class="sr">Período</span><select name="periodo">
          <option value="todos">Qualquer data</option>
          <option value="7" ${estado.periodo === "7" ? "selected" : ""}>Últimos 7 dias</option>
          <option value="30" ${estado.periodo === "30" ? "selected" : ""}>Últimos 30 dias</option>
          ${meses.map(m => `<option value="${m}" ${estado.periodo === m ? "selected" : ""}>${nomeMes(m)}</option>`).join("")}
        </select></label>
        <label><span class="sr">Ordem</span><select name="ordem">
          <option value="recentes">Mais recentes</option>
          <option value="antigos" ${estado.ordem === "antigos" ? "selected" : ""}>Mais antigos</option>
        </select></label>
      </div>
    </div>
    ${tags.length ? `<div class="chips" role="group" aria-label="Filtrar por tag">
      <button type="button" class="chip-filtro" data-tag="" aria-pressed="${!estado.tag}">Tudo</button>
      ${tags.slice(0, 14).map(t => `<button type="button" class="chip-filtro" data-tag="${escapar(t)}" aria-pressed="${t === estado.tag}">#${escapar(t)}</button>`).join("")}
    </div>` : ""}`;

  let timer;
  const ler = () => {
    const f = new FormData();
    alvo.querySelectorAll("input, select").forEach(el => f.set(el.name, el.value));
    return { ...estado, q: f.get("q") || "", categoria: f.get("categoria") || "", periodo: f.get("periodo") || "todos", ordem: f.get("ordem") || "recentes" };
  };
  alvo.querySelector('input[name="q"]').addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => { estado = ler(); aoMudar(estado); }, 160);
  });
  alvo.querySelectorAll("select").forEach(s => s.addEventListener("change", () => { estado = ler(); aoMudar(estado); }));
  alvo.querySelectorAll(".chip-filtro").forEach(b => b.addEventListener("click", () => {
    alvo.querySelectorAll(".chip-filtro").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    estado = { ...ler(), tag: b.dataset.tag };
    aoMudar(estado);
  }));
}

let toastTimer;
export function toast(texto) {
  const el = document.getElementById("toast");
  el.textContent = texto;
  el.classList.add("visivel");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visivel"), 3200);
}
