// Página de um corte: player com controle de velocidade + link para o trecho no guia da live.
import { carregarColecao, porSlug } from "../lib/data.js";
import { dataLonga, escapar } from "../lib/format.js";
import { criarPlayer } from "../components/player.js";
import { cardVideo, erro, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

export async function paginaVideo(alvo, slug) {
  let item, lives;
  try {
    [item, lives] = await Promise.all([porSlug("cortes", slug), carregarColecao("lives")]);
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!item) {
    alvo.innerHTML = vazio({ titulo: "Corte não encontrado", texto: "Talvez ele tenha mudado de endereço.", acao: { href: "#/", texto: "Ver as lives" } });
    return;
  }
  document.title = `${item.titulo} · Cortes`;
  const live = lives.find(l => (l.cortes || []).includes(item.id));
  const todos = live ? await carregarColecao("cortes") : [];
  const outros = live ? live.cortes.filter(id => id !== item.id).map(id => todos.find(c => c.id === id)).filter(Boolean).slice(0, 3) : [];

  alvo.innerHTML = `
    <nav class="migalhas" aria-label="Você está em"><a href="#/">Lives</a>${live ? ` / <a href="${live.href}">${escapar(live.titulo)}</a>` : ""}</nav>
    <article class="pagina-video">
      <div class="pagina-video__player"></div>
      <div class="pagina-video__info">
        <div class="card__meta"><span class="chip">${escapar(item.categoria)}</span></div>
        <h1>${escapar(item.titulo)}</h1>
        <p class="meta-linha">
          <span>${icone("calendario")} ${dataLonga(item.data)}</span>
          ${item.duracao ? `<span>${icone("relogio")} ${escapar(item.duracao)}</span>` : ""}
        </p>
        <p class="lead">${escapar(item.descricao)}</p>
        <div class="acoes">
          ${item.fonte ? `<a class="botao" href="${escapar(item.fonte)}">${icone("lista")} ${escapar(item.rotuloFonte || "Ver no guia da live")}</a>` : ""}
        </div>
        <p class="dica-teclado">Atalhos: <kbd>espaço</kbd> play · <kbd>←</kbd><kbd>→</kbd> 5s · <kbd>&lt;</kbd><kbd>&gt;</kbd> velocidade · <kbd>f</kbd> tela cheia</p>
      </div>
    </article>
    ${outros.length ? `<section class="relacionados"><h2>Mais cortes desta live</h2><div class="grade grade--video">${outros.map(cardVideo).join("")}</div>
      <p><a class="ver-tudo" href="${live.href}?s=cortes">Ver todos os cortes ${icone("seta")}</a></p></section>` : ""}`;

  criarPlayer(alvo.querySelector(".pagina-video__player"), { video: item.video, miniatura: item.miniatura, titulo: item.titulo });
}
