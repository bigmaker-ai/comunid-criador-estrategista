// Página de uma live: tarefa pedida (quando houver), cortes da live e guia de navegação por tempo.
import { cortesDaLive, porSlug, urlDe } from "../lib/data.js";
import { dataLonga, escapar, paraSegundos, tempo } from "../lib/format.js";
import { criarPlayer, detectarFonte } from "../components/player.js";
import { cardVideo, erro, toast, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

const botaoTempo = t => `<button type="button" class="marca-tempo" data-t="${paraSegundos(t)}">${escapar(tempo(paraSegundos(t)))}</button>`;

function blocoTarefas(tarefas) {
  if (!tarefas?.length) return "";
  return `<section class="tarefa" id="tarefa" aria-labelledby="tarefa-titulo">
    <h2 id="tarefa-titulo">${icone("estrela")} ${tarefas.length > 1 ? "Tarefas pedidas na live" : "Tarefa pedida na live"}</h2>
    <ul>${tarefas.map(t => `<li><p>${escapar(t.texto)}</p>${t.t ? botaoTempo(t.t) : ""}</li>`).join("")}</ul>
  </section>`;
}

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
  let item, cortes;
  try {
    item = await porSlug("lives", slug);
    cortes = item ? await cortesDaLive(item) : [];
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!item) {
    alvo.innerHTML = vazio({ titulo: "Live não encontrada", texto: "Confira a lista de lives.", acao: { href: "#/", texto: "Ver as lives" } });
    return;
  }
  document.title = `${item.titulo} · Resumos das lives`;
  const fonte = detectarFonte(item.video);
  const podeEmbutir = fonte && (fonte.tipo === "arquivo" || fonte.tipo === "youtube");
  const linkLive = item.linkLive || fonte?.url;

  alvo.innerHTML = `
    <nav class="migalhas" aria-label="Você está em"><a href="#/">Lives</a> / ${escapar(item.titulo)}</nav>
    <header class="live-topo">
      <div class="live-topo__texto">
        <h1>${escapar(item.titulo)}</h1>
        <p class="lead">${escapar(item.descricao)}</p>
        <p class="meta-linha">
          <span>${icone("calendario")} ${dataLonga(item.data)}</span>
          ${item.duracao ? `<span>${icone("relogio")} ${escapar(item.duracao)} de live</span>` : ""}
        </p>
        <div class="acoes">
          ${linkLive ? `<a class="botao" href="${escapar(linkLive)}" target="_blank" rel="noopener">${icone("play")} Assistir à live completa</a>` : ""}
          ${cortes.length ? `<a class="botao botao--sec" href="#" data-ir="cortes">${icone("tesoura")} ${cortes.length} melhores cortes</a>` : ""}
        </div>
      </div>
      <div class="live-topo__midia">${podeEmbutir ? "" : item.miniatura ? `<img src="${escapar(urlDe(item.miniatura))}" alt="">` : ""}</div>
    </header>
    <div class="live-corpo">
      ${blocoTarefas(item.tarefas)}
      ${cortes.length ? `<section class="cortes-live" id="cortes" aria-labelledby="cortes-titulo">
        <h2 id="cortes-titulo">${icone("tesoura")} Cortes desta live</h2>
        <p class="guia__ajuda">Os melhores trechos, com controle de velocidade.</p>
        <div class="grade grade--video">${cortes.map(cardVideo).join("")}</div>
      </section>` : ""}
      ${guiaNavegacao(item.capitulos)}
    </div>`;

  let player = null;
  if (podeEmbutir) {
    player = criarPlayer(alvo.querySelector(".live-topo__midia"), { video: item.video, miniatura: item.miniatura, titulo: item.titulo });
  }

  alvo.addEventListener("click", e => {
    const ir = e.target.closest("[data-ir]");
    if (ir) {
      e.preventDefault();
      document.getElementById(ir.dataset.ir)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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

  // ?s=cortes rola até a seção; ?t=segundos destaca o capítulo do guia
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
}
