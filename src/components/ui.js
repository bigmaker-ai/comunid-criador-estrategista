// Peças de interface reutilizadas pelas páginas.
import { urlDe } from "../lib/data.js";
import { dataCurta, escapar } from "../lib/format.js";
import { icone } from "./icones.js";

function capa(item) {
  return item.miniatura
    ? `<img src="${escapar(urlDe(item.miniatura))}" alt="" loading="lazy" decoding="async">`
    : `<span class="capa-vazia" aria-hidden="true">${icone("video")}</span>`;
}

/** Card com miniatura grande (cortes). */
export function cardVideo(item) {
  return `<article class="card card--video">
    <a class="card__link" href="${item.href}">
      <div class="card__capa">
        ${capa(item)}
        <span class="card__play" aria-hidden="true">${icone("play")}</span>
        ${item.duracao ? `<span class="card__duracao">${escapar(item.duracao)}</span>` : ""}
      </div>
      <div class="card__corpo">
        <div class="card__meta"><span class="chip">${escapar(item.categoria || "")}</span></div>
        <h3 class="card__titulo">${escapar(item.titulo)}</h3>
        <p class="card__desc">${escapar(item.descricao || "")}</p>
      </div>
    </a>
  </article>`;
}

/** Card de texto (lives anteriores). */
export function cardResumo(item) {
  const [a, m, d] = String(item.data).split("-");
  return `<article class="card card--resumo">
    <a class="card__link" href="${item.href}">
      <div class="card__data" aria-hidden="true"><strong>${d}</strong><span>${m}/${a.slice(2)}</span></div>
      <div class="card__corpo">
        <h3 class="card__titulo">${escapar(item.titulo)}</h3>
        <p class="card__desc">${escapar(item.descricao || "")}</p>
        <div class="card__rodape"><time datetime="${escapar(item.data)}">${dataCurta(item.data)}</time></div>
      </div>
      <span class="card__seta" aria-hidden="true">${icone("seta")}</span>
    </a>
  </article>`;
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

let toastTimer;
export function toast(texto) {
  const el = document.getElementById("toast");
  el.textContent = texto;
  el.classList.add("visivel");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visivel"), 3200);
}
