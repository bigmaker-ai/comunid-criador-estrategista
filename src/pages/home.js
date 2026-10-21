// Página inicial: lista das lives (a mais recente em destaque).
import { carregarColecao, urlDe } from "../lib/data.js";
import { dataLonga, escapar } from "../lib/format.js";
import { cardResumo, erro, esqueleto, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

export async function paginaHome(alvo) {
  alvo.innerHTML = `<div class="hero hero--carregando"></div>` + esqueleto(2, "resumo");
  let lives;
  try {
    lives = await carregarColecao("lives");
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!lives.length) {
    alvo.innerHTML = vazio({ titulo: "Nenhuma live publicada ainda", texto: "O guia da próxima live aparece aqui assim que for publicado." });
    return;
  }
  const [d, ...anteriores] = lives;
  alvo.innerHTML = `
    <section class="hero">
      <div class="hero__texto">
        <p class="eyebrow eyebrow--pixel">✺ Live mais recente</p>
        <h1 class="hero__titulo">${escapar(d.titulo)}</h1>
        <p class="hero__desc">${escapar(d.descricao)}</p>
        <div class="hero__meta">
          <span>${icone("calendario")} ${dataLonga(d.data)}</span>
          ${d.duracao ? `<span>${icone("relogio")} ${escapar(d.duracao)}</span>` : ""}
          ${d.cortes?.length ? `<span>${icone("tesoura")} ${d.cortes.length} cortes</span>` : ""}
        </div>
        <div class="hero__acoes">
          <a class="botao" href="${d.href}">${icone("lista")} Guia de navegação</a>
          ${d.cortes?.length ? `<a class="botao botao--sec" href="${d.href}?s=cortes">${icone("tesoura")} Melhores cortes</a>` : ""}
        </div>
      </div>
      <a class="hero__capa" href="${d.href}" aria-hidden="true" tabindex="-1">
        ${d.miniatura ? `<img src="${escapar(urlDe(d.miniatura))}" alt="" fetchpriority="high">` : ""}
        <span class="hero__brilho"></span>
      </a>
    </section>
    ${anteriores.length ? `<section class="vitrine" aria-labelledby="h-anteriores">
      <div class="vitrine__topo"><div><p class="eyebrow">${icone("lista")} Todas as lives</p><h2 id="h-anteriores">Lives anteriores</h2></div></div>
      <div class="grade grade--resumo">${anteriores.map(cardResumo).join("")}</div>
    </section>` : ""}`;
}
