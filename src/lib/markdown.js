// Markdown -> HTML seguro, com ids nos títulos (para o sumário) e marcas de tempo clicáveis.
import { marked } from "marked";
import { paraSegundos, slugify } from "./format.js";

marked.setOptions({ gfm: true, breaks: false });

const TIMESTAMP = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;

/** Remove scripts, iframes, handlers on* e links javascript: (o conteúdo vem do repositório, mas por garantia). */
function sanitizar(raiz) {
  raiz.querySelectorAll("script, iframe, object, embed, style, link, meta").forEach(e => e.remove());
  raiz.querySelectorAll("*").forEach(el => {
    for (const attr of [...el.attributes]) {
      const nome = attr.name.toLowerCase();
      if (nome.startsWith("on")) el.removeAttribute(attr.name);
      if ((nome === "href" || nome === "src") && /^\s*javascript:/i.test(attr.value)) el.removeAttribute(attr.name);
    }
  });
  raiz.querySelectorAll('a[href^="http"]').forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
}

/**
 * Retorna { html, sumario: [{id, texto, nivel}] }.
 * "[1:02:30]" vira <button class="marca-tempo" data-t="3750">1:02:30</button>.
 */
export function renderizarMarkdown(texto) {
  const doc = new DOMParser().parseFromString(`<div>${marked.parse(texto || "")}</div>`, "text/html");
  const raiz = doc.body.firstElementChild;
  sanitizar(raiz);

  const sumario = [];
  const usados = new Set();
  raiz.querySelectorAll("h2, h3").forEach(h => {
    let id = slugify(h.textContent) || "secao";
    while (usados.has(id)) id += "-2";
    usados.add(id);
    h.id = id;
    sumario.push({ id, texto: h.textContent.replace(TIMESTAMP, "").trim(), nivel: Number(h.tagName[1]) });
  });

  // marcas de tempo em nós de texto (fora de links e código)
  const walker = doc.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  const nos = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (TIMESTAMP.test(n.nodeValue) && !n.parentElement.closest("a, code, pre")) nos.push(n);
    TIMESTAMP.lastIndex = 0;
  }
  for (const n of nos) {
    const frag = doc.createDocumentFragment();
    let ultimo = 0;
    n.nodeValue.replace(TIMESTAMP, (m, t, pos) => {
      frag.append(n.nodeValue.slice(ultimo, pos));
      const b = doc.createElement("button");
      b.type = "button";
      b.className = "marca-tempo";
      b.dataset.t = paraSegundos(t);
      b.textContent = t;
      b.title = `Ir para ${t}`;
      frag.append(b);
      ultimo = pos + m.length;
    });
    frag.append(n.nodeValue.slice(ultimo));
    n.replaceWith(frag);
  }
  return { html: raiz.innerHTML, sumario };
}
