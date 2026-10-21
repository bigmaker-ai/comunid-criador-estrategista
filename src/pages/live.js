// Página de um resumo de live: player/link da live, guia de navegação por tempo, sumário e texto.
import { carregarMarkdown, porSlug, relacionados, urlDe } from "../lib/data.js";
import { dataLonga, escapar, paraSegundos, tempo } from "../lib/format.js";
import { renderizarMarkdown } from "../lib/markdown.js";
import { criarPlayer, detectarFonte } from "../components/player.js";
import { cardPara, erro, seloDemo, toast, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

function guiaNavegacao(capitulos) {
  if (!capitulos?.length) return "";
  return `<section class="guia" id="guia" aria-labelledby="guia-titulo">
    <h2 id="guia-titulo">${icone("lista")} Guia de navegação</h2>
    <p class="guia__ajuda">Clique em um tempo para ir direto àquele momento da live.</p>
    <ol class="guia__lista">
      ${capitulos.map(c => `<li class="${c.destaque ? "destaque" : ""}">
        <button type="button" class="guia__tempo marca-tempo" data-t="${paraSegundos(c.t)}">${escapar(tempo(paraSegundos(c.t)))}</button>
        <div><strong>${escapar(c.titulo)}${c.destaque ? ` <span class="selo selo--destaque">${icone("estrela")} imperdível</span>` : ""}</strong>
        ${c.resumo ? `<p>${escapar(c.resumo)}</p>` : ""}</div>
      </li>`).join("")}
    </ol>
  </section>`;
}

export async function paginaLive(alvo, slug, query) {
  let item, texto;
  try {
    item = await porSlug("lives", slug);
    if (item?.conteudo) texto = await carregarMarkdown(item.conteudo);
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!item) {
    alvo.innerHTML = vazio({ titulo: "Resumo não encontrado", texto: "Confira a lista de resumos.", acao: { href: "#/lives", texto: "Ver resumos" } });
    return;
  }
  document.title = `${item.titulo} · Resumos das lives`;
  const { html, sumario } = renderizarMarkdown(texto || "");
  const fonte = detectarFonte(item.video);
  const podeEmbutir = fonte && (fonte.tipo === "arquivo" || fonte.tipo === "youtube");
  const linkLive = item.linkLive || fonte?.url;
  const itensSumario = [...(item.capitulos?.length ? [{ id: "guia", texto: "Guia de navegação", nivel: 2 }] : []), ...sumario];

  alvo.innerHTML = `
    <nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/lives">Resumos das lives</a></nav>
    <header class="live-topo">
      <div class="live-topo__texto">
        <div class="card__meta"><span class="chip">${escapar(item.categoria)}</span>${seloDemo(item)}</div>
        <h1>${escapar(item.titulo)}</h1>
        <p class="lead">${escapar(item.descricao)}</p>
        <p class="meta-linha">
          <span>${icone("calendario")} ${dataLonga(item.data)}</span>
          ${item.duracao ? `<span>${icone("relogio")} ${escapar(item.duracao)} de live</span>` : ""}
        </p>
        ${linkLive ? `<a class="botao" href="${escapar(linkLive)}" target="_blank" rel="noopener">${icone("play")} Assistir à live completa</a>` : ""}
      </div>
      <div class="live-topo__midia">${podeEmbutir ? "" : item.miniatura ? `<img src="${escapar(urlDe(item.miniatura))}" alt="">` : ""}</div>
    </header>
    <div class="leitura">
      <aside class="sumario" aria-label="Sumário">
        <details open>
          <summary>${icone("lista")} Nesta página</summary>
          <ol>${itensSumario.map(s => `<li class="n${s.nivel}"><a href="#" data-alvo="${s.id}">${escapar(s.texto)}</a></li>`).join("")}</ol>
        </details>
      </aside>
      <article class="leitura__texto">
        ${guiaNavegacao(item.capitulos)}
        <div class="prosa">${html}</div>
        <section class="relacionados" hidden><h2 id="cortes-relacionados">Cortes desta live</h2><div class="grade grade--video"></div></section>
      </article>
    </div>`;

  let player = null;
  if (podeEmbutir) {
    player = criarPlayer(alvo.querySelector(".live-topo__midia"), { video: item.video, miniatura: item.miniatura, titulo: item.titulo });
  }

  // marcas de tempo (guia e texto)
  alvo.addEventListener("click", e => {
    const b = e.target.closest(".marca-tempo");
    if (!b) return;
    const seg = Number(b.dataset.t);
    if (player) {
      player.irPara(seg);
      alvo.querySelector(".live-topo").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (linkLive) {
      navigator.clipboard?.writeText(tempo(seg)).catch(() => {});
      toast(`Abrindo a live: vá até ${tempo(seg)} (tempo copiado).`);
      window.open(linkLive, "_blank", "noopener");
    }
  });

  // sumário: rolagem suave + destaque da seção atual
  const links = [...alvo.querySelectorAll(".sumario a")];
  alvo.querySelector(".sumario").addEventListener("click", e => {
    const a = e.target.closest("a[data-alvo]");
    if (!a) return;
    e.preventDefault();
    document.getElementById(a.dataset.alvo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (matchMedia("(max-width: 960px)").matches) a.closest("details").open = false;
  });
  const obs = new IntersectionObserver(entradas => {
    for (const en of entradas) {
      if (!en.isIntersecting) continue;
      links.forEach(l => l.classList.toggle("ativo", l.dataset.alvo === en.target.id));
    }
  }, { rootMargin: "-20% 0px -70% 0px" });
  itensSumario.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
  if (matchMedia("(max-width: 960px)").matches) alvo.querySelector(".sumario details").open = false;

  // ?s=secao rola até a seção; ?t=segundos destaca o capítulo
  const s = query.get("s");
  if (s) requestAnimationFrame(() => document.getElementById(s)?.scrollIntoView({ block: "start" }));
  const t = query.get("t");
  if (t) {
    const alvoT = [...alvo.querySelectorAll(".guia__tempo")].filter(b => Number(b.dataset.t) <= Number(t)).pop();
    if (alvoT) {
      alvoT.closest("li").classList.add("piscar");
      requestAnimationFrame(() => alvoT.scrollIntoView({ block: "center" }));
    }
  }

  const rel = await relacionados(item.relacionados);
  if (rel.length) {
    const sec = alvo.querySelector(".relacionados");
    sec.hidden = false;
    sec.querySelector(".grade").innerHTML = rel.map(cardPara).join("");
  }
}
