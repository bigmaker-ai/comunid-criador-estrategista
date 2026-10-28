// Galeria dos vídeos que os alunos mandaram no grupo: por dia ou semana, com ordenação.
import { carregarGaleria, urlDe } from "../lib/data.js";
import { dataCurta, escapar, parseData } from "../lib/format.js";
import { atualizarQuery } from "../lib/router.js";
import { criarPlayer } from "../components/player.js";
import { erro, esqueleto, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

const ORDENS = {
  recentes: { rotulo: "Mais recentes", valor: v => v.data + " " + v.hora },
  respostas: { rotulo: "Mais comentados no grupo", valor: v => v.respostas || 0 },
};
const ORIGEM = { whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];


/** Segunda-feira da semana da data (AAAA-MM-DD). */
export function inicioDaSemana(iso) {
  const d = parseData(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function rotuloGrupo(chave, agrupar) {
  if (agrupar === "semana") {
    const fim = parseData(chave);
    fim.setDate(fim.getDate() + 6);
    return `Semana de ${dataCurta(chave).slice(0, 5)} a ${String(fim.getDate()).padStart(2, "0")}/${String(fim.getMonth() + 1).padStart(2, "0")}`;
  }
  const dia = DIAS[parseData(chave).getDay()];
  return `${dia[0].toUpperCase() + dia.slice(1)}, ${dataCurta(chave).slice(0, 5)}`;
}

function avatar(v) {
  return v.autor?.foto
    ? `<img class="autor__foto" src="${escapar(urlDe(v.autor.foto))}" alt="" loading="lazy">`
    : `<span class="autor__foto autor__foto--vazia" aria-hidden="true">👤</span>`;
}

function card(v) {
  const n = v.respostas || 0;
  const metricas = `<span title="Respostas no grupo">${icone("chat")} ${n} ${n === 1 ? "comentário" : "comentários"} no grupo</span>`;
  return `<article class="gcard">
    <button type="button" class="gcard__capa" data-id="${escapar(v.id)}" aria-label="Assistir vídeo de ${escapar(v.autor?.nome || "membro do grupo")}">
      ${v.miniatura ? `<img src="${escapar(urlDe(v.miniatura))}" alt="" loading="lazy" decoding="async">` : `<span class="capa-vazia">${icone("video")}</span>`}
      <span class="card__play" aria-hidden="true">${icone("play")}</span>
      <span class="gcard__origem gcard__origem--${v.tipo}">${ORIGEM[v.tipo]}</span>
      ${v.duracao ? `<span class="card__duracao">${escapar(v.duracao)}</span>` : ""}
    </button>
    <div class="gcard__corpo">
      <div class="autor">${avatar(v)}<div><strong>${escapar(v.autor?.nome || "Membro do grupo")}</strong>
        <small>${dataCurta(v.data).slice(0, 5)} às ${escapar(v.hora)}${v.perfil ? ` · @${escapar(v.perfil)}` : ""}</small></div></div>
      ${v.legenda ? `<p class="gcard__legenda">${escapar(v.legenda)}</p>` : ""}
      <div class="gcard__metricas">${metricas}</div>
    </div>
  </article>`;
}

function abrirModal(v) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `<div class="modal__caixa">
      <button type="button" class="modal__fechar" aria-label="Fechar">✕</button>
      <div class="modal__player"></div>
      <div class="modal__info">
        <div class="autor">${avatar(v)}<div><strong>${escapar(v.autor?.nome || "Membro do grupo")}</strong>
          <small>${dataCurta(v.data)} às ${escapar(v.hora)} · enviado pelo ${ORIGEM[v.tipo] === "WhatsApp" ? "WhatsApp" : ORIGEM[v.tipo]}</small></div></div>
        ${v.legenda ? `<p>${escapar(v.legenda)}</p>` : ""}
        ${v.original ? `<a class="botao botao--sec" href="${escapar(v.original)}" target="_blank" rel="noopener">Ver no ${ORIGEM[v.tipo]} ${icone("externo")}</a>` : ""}
      </div>
    </div>`;
  document.body.append(modal);
  document.body.style.overflow = "hidden";
  const player = criarPlayer(modal.querySelector(".modal__player"), { video: v.video, miniatura: v.miniatura, titulo: v.autor?.nome || "Vídeo do grupo" });
  const fechar = () => {
    player.destruir();
    modal.remove();
    document.body.style.overflow = "";
    removeEventListener("keydown", tecla);
    removeEventListener("hashchange", fechar);
  };
  const tecla = e => { if (e.key === "Escape") fechar(); };
  modal.addEventListener("click", e => { if (e.target === modal || e.target.closest(".modal__fechar")) fechar(); });
  addEventListener("keydown", tecla);
  addEventListener("hashchange", fechar);
  modal.querySelector(".player")?.focus();
}

export async function paginaGaleria(alvo, query) {
  alvo.innerHTML = `<section class="cabecalho"><p class="eyebrow">${icone("video")} Feito pela turma</p>
      <h1>Galeria do grupo</h1>
      <p class="cabecalho__texto">Os vídeos que os alunos criaram e mandaram no grupo: vídeos-presente, testes e trabalhos para clientes.</p></section>
    <div class="gfiltros"></div><div class="resultado">${esqueleto(8, "galeria")}</div>`;
  let videos;
  try {
    videos = await carregarGaleria();
  } catch (e) {
    alvo.querySelector(".resultado").innerHTML = erro(e);
    return;
  }
  if (!videos.length) {
    alvo.querySelector(".resultado").innerHTML = vazio({ titulo: "Nenhum vídeo ainda", texto: "Os vídeos do grupo aparecem aqui assim que forem publicados." });
    return;
  }
  const estado = {
    agrupar: query.get("agrupar") === "dia" ? "dia" : "semana",
    ordem: ORDENS[query.get("ordem")] ? query.get("ordem") : "recentes",
    origem: query.get("origem") || "",
  };
  const filtros = alvo.querySelector(".gfiltros");
  filtros.innerHTML = `
    <div class="segmentado" role="group" aria-label="Agrupar por">
      <button type="button" data-agrupar="semana">Por semana</button><button type="button" data-agrupar="dia">Por dia</button>
    </div>
    <label><span class="sr">Ordenar</span><select name="ordem">${Object.entries(ORDENS).map(([k, o]) => `<option value="${k}">${o.rotulo}</option>`).join("")}</select></label>
    <label><span class="sr">Origem</span><select name="origem"><option value="">Todas as origens</option>${
      [...new Set(videos.map(v => v.tipo))].map(t => `<option value="${t}">${ORIGEM[t]}</option>`).join("")}</select></label>
    <span class="gfiltros__total">${videos.length} vídeos</span>`;

  function desenhar() {
    atualizarQuery({ agrupar: estado.agrupar !== "semana" && estado.agrupar, ordem: estado.ordem !== "recentes" && estado.ordem, origem: estado.origem });
    filtros.querySelectorAll("[data-agrupar]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.agrupar === estado.agrupar)));
    filtros.querySelector('[name="ordem"]').value = estado.ordem;
    filtros.querySelector('[name="origem"]').value = estado.origem;
    const valor = ORDENS[estado.ordem].valor;
    const lista = videos.filter(v => !estado.origem || v.tipo === estado.origem)
      .sort((a, b) => (valor(b) > valor(a) ? 1 : valor(b) < valor(a) ? -1 : (b.data + b.hora).localeCompare(a.data + a.hora)));
    const grupos = new Map();
    for (const v of lista) {
      const chave = estado.agrupar === "semana" ? inicioDaSemana(v.data) : v.data;
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(v);
    }
    const chaves = [...grupos.keys()].sort().reverse();
    alvo.querySelector(".resultado").innerHTML = lista.length
      ? chaves.map(k => `<section class="ggrupo"><h2>${escapar(rotuloGrupo(k, estado.agrupar))} <span>${grupos.get(k).length}</span></h2>
          <div class="grade grade--galeria">${grupos.get(k).map(card).join("")}</div></section>`).join("")
      : vazio({ titulo: "Nada com esse filtro", texto: "Tente outra origem." });
  }
  filtros.addEventListener("click", e => {
    const b = e.target.closest("[data-agrupar]");
    if (b) { estado.agrupar = b.dataset.agrupar; desenhar(); }
  });
  filtros.addEventListener("change", e => {
    if (e.target.name === "ordem") estado.ordem = e.target.value;
    if (e.target.name === "origem") estado.origem = e.target.value;
    desenhar();
  });
  alvo.addEventListener("click", e => {
    const b = e.target.closest(".gcard__capa");
    if (b) abrirModal(videos.find(v => v.id === b.dataset.id));
  });
  desenhar();
}
