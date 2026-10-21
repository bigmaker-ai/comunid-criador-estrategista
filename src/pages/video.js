// Página de um corte ou de um vídeo da comunidade.
import { porSlug, relacionados, COLECOES } from "../lib/data.js";
import { dataLonga, escapar } from "../lib/format.js";
import { renderizarMarkdown } from "../lib/markdown.js";
import { criarPlayer, detectarFonte } from "../components/player.js";
import { cardPara, erro, seloDemo, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

export async function paginaVideo(alvo, colecao, slug) {
  let item;
  try {
    item = await porSlug(colecao, slug);
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!item) {
    alvo.innerHTML = vazio({ titulo: "Vídeo não encontrado", texto: "Talvez ele tenha mudado de endereço.", acao: { href: "#/" + colecao, texto: "Ver todos" } });
    return;
  }
  document.title = `${item.titulo} · ${COLECOES[colecao].nome}`;
  const fonte = detectarFonte(item.video);
  const corpo = item.conteudo ? renderizarMarkdown(item.conteudo).html : "";

  alvo.innerHTML = `
    <nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/${colecao}">${COLECOES[colecao].nome}</a></nav>
    <article class="pagina-video">
      <div class="pagina-video__player"></div>
      <div class="pagina-video__info">
        <div class="card__meta"><span class="chip">${escapar(item.categoria)}</span>${seloDemo(item)}</div>
        <h1>${escapar(item.titulo)}</h1>
        <p class="meta-linha">
          <span>${icone("calendario")} ${dataLonga(item.data)}</span>
          ${item.duracao ? `<span>${icone("relogio")} ${escapar(item.duracao)}</span>` : ""}
          ${item.autor ? `<span>${icone("pessoas")} ${escapar(item.autor)}</span>` : ""}
        </p>
        <p class="lead">${escapar(item.descricao)}</p>
        ${corpo ? `<div class="prosa">${corpo}</div>` : ""}
        ${item.tags?.length ? `<ul class="tags">${item.tags.map(t => `<li><a href="#/${colecao}?tag=${encodeURIComponent(t)}">#${escapar(t)}</a></li>`).join("")}</ul>` : ""}
        <div class="acoes">
          ${item.fonte ? `<a class="botao" href="${escapar(item.fonte)}" ${/^https?:/.test(item.fonte) ? 'target="_blank" rel="noopener"' : ""}>${icone("play")} ${escapar(item.rotuloFonte || "Ver na live completa")}</a>` : ""}
          ${fonte && fonte.tipo !== "arquivo" ? `<a class="botao botao--sec" href="${escapar(fonte.url)}" target="_blank" rel="noopener">Abrir na plataforma original ${icone("externo")}</a>` : ""}
        </div>
        ${colecao === "cortes" ? `<p class="dica-teclado">Atalhos: <kbd>espaço</kbd> play · <kbd>←</kbd><kbd>→</kbd> 5s · <kbd>&lt;</kbd><kbd>&gt;</kbd> velocidade · <kbd>f</kbd> tela cheia</p>` : ""}
      </div>
    </article>
    <section class="relacionados" hidden><h2>Relacionados</h2><div class="grade grade--video"></div></section>`;

  criarPlayer(alvo.querySelector(".pagina-video__player"), { video: item.video, miniatura: item.miniatura, titulo: item.titulo });

  const rel = await relacionados(item.relacionados);
  if (rel.length) {
    const s = alvo.querySelector(".relacionados");
    s.hidden = false;
    s.querySelector(".grade").innerHTML = rel.map(cardPara).join("");
  }
}
