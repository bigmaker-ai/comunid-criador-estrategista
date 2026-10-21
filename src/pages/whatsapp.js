// Página de um resumo do WhatsApp: tópicos, avisos importantes e atalho para a mensagem original no grupo.
//
// O WhatsApp não tem link direto para uma mensagem específica. O botão "Ir para a mensagem" faz o
// mais próximo possível: copia um trecho da mensagem e abre o grupo no WhatsApp do computador
// (ou do celular). Lá, Ctrl+F (busca do grupo) + Ctrl+V leva direto até ela.
import { carregarConfig, porSlug, relacionados } from "../lib/data.js";
import { dataLonga, escapar } from "../lib/format.js";
import { renderizarMarkdown } from "../lib/markdown.js";
import { cardPara, erro, seloDemo, toast, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

function horaMensagem(m) {
  if (!m.quando) return "";
  const [data, hora] = m.quando.split(" ");
  const [, mes, dia] = data.split("-");
  return `${dia}/${mes}${hora ? " às " + hora : ""}`;
}

function mensagem(m, grupo) {
  const autor = m.autor && m.autorizado === true ? m.autor : null;
  return `<li class="msg">
    <blockquote class="msg__bolha">
      <p>${escapar(m.trecho)}</p>
      <footer>${autor ? `<span>${escapar(autor)}</span> · ` : ""}<time>${escapar(horaMensagem(m))}</time></footer>
    </blockquote>
    ${grupo?.convite ? `<button type="button" class="botao-zap" data-busca="${escapar(m.busca || m.trecho)}" data-convite="${escapar(grupo.convite)}">
      ${icone("zap")} Ir para a mensagem</button>` : ""}
  </li>`;
}

export async function paginaWhatsapp(alvo, slug) {
  let item, config;
  try {
    [item, config] = await Promise.all([porSlug("whatsapp", slug), carregarConfig()]);
  } catch (e) {
    alvo.innerHTML = erro(e);
    return;
  }
  if (!item) {
    alvo.innerHTML = vazio({ titulo: "Resumo não encontrado", texto: "Confira a lista de resumos do grupo.", acao: { href: "#/whatsapp", texto: "Ver resumos" } });
    return;
  }
  document.title = `${item.titulo} · Resumos do WhatsApp`;
  const grupo = (config.grupos || []).find(g => g.id === item.grupo);
  const topicos = item.topicos || [];

  alvo.innerHTML = `
    <nav class="migalhas" aria-label="Você está em"><a href="#/">Início</a> / <a href="#/whatsapp">Resumos do WhatsApp</a></nav>
    <header class="live-topo live-topo--zap">
      <div class="live-topo__texto">
        <div class="card__meta"><span class="chip">${escapar(item.categoria)}</span>${seloDemo(item)}</div>
        <h1>${escapar(item.titulo)}</h1>
        <p class="lead">${escapar(item.descricao)}</p>
        <p class="meta-linha">
          <span>${icone("calendario")} ${dataLonga(item.data)}</span>
          ${item.periodo ? `<span>${icone("relogio")} conversas de ${escapar(item.periodo)}</span>` : ""}
          ${grupo ? `<span>${icone("chat")} ${escapar(grupo.nome)}</span>` : ""}
        </p>
      </div>
    </header>
    <div class="leitura">
      <aside class="sumario" aria-label="Tópicos">
        <details open>
          <summary>${icone("lista")} Tópicos</summary>
          <ol>${item.importante?.length ? `<li class="n2"><a href="#" data-alvo="importante">Importante</a></li>` : ""}
            ${topicos.map((t, i) => `<li class="n2"><a href="#" data-alvo="topico-${i + 1}">${escapar(t.titulo)}</a></li>`).join("")}</ol>
        </details>
        <div class="como-funciona">
          <strong>${icone("zap")} Como o "Ir para a mensagem" funciona</strong>
          <p>O botão copia um trecho e abre o grupo no WhatsApp. Lá, aperte <kbd>Ctrl</kbd>+<kbd>F</kbd> e cole (<kbd>Ctrl</kbd>+<kbd>V</kbd>) para cair direto na mensagem e responder.</p>
        </div>
      </aside>
      <article class="leitura__texto">
        ${item.importante?.length ? `<section class="importante" id="importante" aria-labelledby="imp-t">
          <h2 id="imp-t">${icone("estrela")} Importante</h2>
          <ul>${item.importante.map(i => `<li>${escapar(i)}</li>`).join("")}</ul>
        </section>` : ""}
        ${topicos.map((t, i) => `<section class="topico" id="topico-${i + 1}">
          <h2><span class="topico__n">${String(i + 1).padStart(2, "0")}</span> ${escapar(t.titulo)}</h2>
          <div class="prosa">${renderizarMarkdown(t.resumo || "").html}</div>
          ${t.mensagens?.length ? `<ul class="msgs" aria-label="Mensagens marcantes">${t.mensagens.map(m => mensagem(m, grupo)).join("")}</ul>` : ""}
          ${t.links?.length ? `<ul class="links-uteis">${t.links.map(l => `<li><a href="${escapar(l.url)}" ${/^https?:/.test(l.url) ? 'target="_blank" rel="noopener"' : ""}>${icone("externo")} ${escapar(l.titulo)}</a></li>`).join("")}</ul>` : ""}
        </section>`).join("") || vazio({ titulo: "Resumo sem tópicos", texto: "Este resumo ainda não tem tópicos publicados." })}
        <section class="relacionados" hidden><h2>Relacionados</h2><div class="grade grade--resumo"></div></section>
      </article>
    </div>`;

  alvo.addEventListener("click", async e => {
    const b = e.target.closest(".botao-zap");
    if (b) {
      try {
        await navigator.clipboard.writeText(b.dataset.busca);
        toast("Trecho copiado! No WhatsApp: Ctrl+F e Ctrl+V para achar a mensagem.");
      } catch {
        toast("Abra o grupo e busque por: " + b.dataset.busca);
      }
      window.open(b.dataset.convite, "_blank", "noopener");
      return;
    }
    const a = e.target.closest(".sumario a[data-alvo]");
    if (a) {
      e.preventDefault();
      document.getElementById(a.dataset.alvo)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  if (matchMedia("(max-width: 960px)").matches) alvo.querySelector(".sumario details").open = false;

  const rel = await relacionados(item.relacionados);
  if (rel.length) {
    const sec = alvo.querySelector(".relacionados");
    sec.hidden = false;
    sec.querySelector(".grade").innerHTML = rel.map(cardPara).join("");
  }
}
