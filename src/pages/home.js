// Página inicial: destaque do resumo mais recente + vitrines de cada categoria.
import { carregarConfig, carregarTudo, urlDe } from "../lib/data.js";
import { dataLonga, escapar } from "../lib/format.js";
import { cardResumo, cardVideo, erro, esqueleto, seloDemo, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

function secao({ id, eyebrow, titulo, href, conteudo, icon }) {
  return `<section class="vitrine" aria-labelledby="${id}">
    <div class="vitrine__topo">
      <div><p class="eyebrow">${icone(icon)} ${escapar(eyebrow)}</p><h2 id="${id}">${escapar(titulo)}</h2></div>
      <a class="ver-tudo" href="${href}">Ver tudo ${icone("seta")}</a>
    </div>
    ${conteudo}
  </section>`;
}

export async function paginaHome(alvo) {
  alvo.innerHTML = `<div class="hero hero--carregando"></div>` + esqueleto(3);
  let tudo, config;
  try {
    [tudo, config] = await Promise.all([carregarTudo(), carregarConfig()]);
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  const { cortes, lives, whatsapp, comunidade } = tudo;
  // destaque: o resumo de live mais recente (é o que leva a pessoa a assistir à live completa);
  // sem lives, o resumo do WhatsApp mais recente. Conteúdo real vem antes de demonstração.
  const porData = lista => [...lista].sort((a, b) => (!!a.demo - !!b.demo) || b.data.localeCompare(a.data));
  const resumos = [...porData(lives), ...porData(whatsapp)];
  const d = resumos[0];
  const melhoresCortes = [...cortes].sort((a, b) => (b.destaque === true) - (a.destaque === true) || (a.demo - b.demo)).slice(0, 6);

  const hero = d ? `<section class="hero">
      <div class="hero__texto">
        <p class="eyebrow eyebrow--pixel">✺ Mais recente</p>
        <h1 class="hero__titulo">${escapar(d.titulo)}</h1>
        <p class="hero__desc">${escapar(d.descricao)}</p>
        <div class="hero__meta">
          <span>${icone("calendario")} ${dataLonga(d.data)}</span>
          ${d.duracao ? `<span>${icone("relogio")} ${escapar(d.duracao)}</span>` : ""}
          ${seloDemo(d)}
        </div>
        <div class="hero__acoes">
          <a class="botao" href="${d.href}">Ler o resumo ${icone("seta")}</a>
          ${d.colecao === "lives" ? `<a class="botao botao--sec" href="${d.href}?s=guia">${icone("lista")} Guia de navegação</a>` : ""}
        </div>
      </div>
      <a class="hero__capa" href="${d.href}" aria-hidden="true" tabindex="-1">
        ${d.miniatura ? `<img src="${escapar(urlDe(d.miniatura))}" alt="" fetchpriority="high">` : ""}
        <span class="hero__brilho"></span>
      </a>
    </section>` : `<section class="hero hero--vazio"><div class="hero__texto">
        <p class="eyebrow eyebrow--pixel">✺ ${escapar(config.nome)}</p>
        <h1 class="hero__titulo">O portal está pronto para a primeira publicação</h1>
        <p class="hero__desc">Assim que o primeiro resumo for publicado, ele aparece aqui em destaque.</p></div></section>`;

  const atalhos = `<nav class="atalhos" aria-label="Categorias">
    <a href="#/cortes">${icone("tesoura")}<strong>Cortes</strong><span>${cortes.length} vídeos</span></a>
    <a href="#/lives">${icone("lista")}<strong>Lives</strong><span>${lives.length} resumos</span></a>
    <a href="#/whatsapp">${icone("chat")}<strong>WhatsApp</strong><span>${whatsapp.length} resumos</span></a>
    <a href="#/comunidade">${icone("pessoas")}<strong>Comunidade</strong><span>${comunidade.length} vídeos</span></a>
  </nav>`;

  const grade = (lista, card, tipo, vazioTxt) => lista.length
    ? `<div class="grade grade--${tipo}">${lista.map(card).join("")}</div>`
    : vazio(vazioTxt);

  alvo.innerHTML = hero + atalhos
    + secao({ id: "h-cortes", icon: "tesoura", eyebrow: "Melhores cortes", titulo: "Assista aos melhores momentos", href: "#/cortes",
        conteudo: grade(melhoresCortes, cardVideo, "video", { titulo: "Nenhum corte ainda", texto: "Os cortes aparecem aqui quando forem publicados." }) })
    + secao({ id: "h-lives", icon: "lista", eyebrow: "Resumos das lives", titulo: "Fique por dentro do que rolou", href: "#/lives",
        conteudo: grade(lives.slice(0, 4), cardResumo, "resumo", { titulo: "Nenhum resumo de live ainda", texto: "Volte depois da próxima live." }) })
    + secao({ id: "h-zap", icon: "chat", eyebrow: "Resumos do WhatsApp", titulo: "O que a galera conversou", href: "#/whatsapp",
        conteudo: grade(whatsapp.slice(0, 4), cardResumo, "resumo", { titulo: "Nenhum resumo do grupo ainda", texto: "Os resumos do grupo aparecem aqui." }) })
    + secao({ id: "h-comunidade", icon: "pessoas", eyebrow: "Vídeos da comunidade", titulo: "Criado por quem acompanha", href: "#/comunidade",
        conteudo: grade(comunidade.slice(0, 3), cardVideo, "video", { titulo: "Nenhum vídeo enviado ainda", texto: "Mande o seu e apareça aqui!", acao: { href: "#/enviar", texto: "Como enviar" } }) })
    + `<section class="chamada">
        <div><p class="eyebrow eyebrow--pixel">Sua vez</p><h2>Fez um vídeo inspirado nas lives?</h2>
        <p>Envie pelo formulário. Depois de revisado, ele entra na galeria da comunidade.</p></div>
        <a class="botao" href="#/enviar">${icone("enviar")} Enviar meu vídeo</a>
      </section>`;
}
