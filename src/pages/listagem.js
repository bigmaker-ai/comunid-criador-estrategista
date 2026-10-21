// Página de listagem com busca e filtros (cortes, lives, whatsapp, comunidade).
import { carregarColecao, carregarConfig } from "../lib/data.js";
import { atualizarQuery } from "../lib/router.js";
import { buscar, filtrar } from "../lib/search.js";
import { cabecalho, cardPara, erro, esqueleto, montarFiltros, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

const TEXTOS = {
  cortes: {
    eyebrow: "Melhores momentos", titulo: "Cortes das lives",
    texto: "Os trechos que valem a pena rever, prontos para assistir em qualquer velocidade.",
    vazio: { titulo: "Nenhum corte por aqui", texto: "Ainda não publicamos cortes com esses filtros." },
  },
  lives: {
    eyebrow: "Perdeu a live?", titulo: "Resumos das lives",
    texto: "O essencial de cada encontro, com guia de navegação por tempo para pular direto ao que interessa.",
    vazio: { titulo: "Nenhum resumo encontrado", texto: "Tente outra busca ou limpe os filtros." },
  },
  whatsapp: {
    eyebrow: "Grupo da comunidade", titulo: "Resumos do WhatsApp",
    texto: "As conversas do grupo organizadas por assunto. Sem números de telefone e sem dados pessoais.",
    vazio: { titulo: "Nenhum resumo do grupo ainda", texto: "Os resumos das conversas aparecem aqui assim que forem publicados." },
  },
  comunidade: {
    eyebrow: "Feito pelos membros", titulo: "Vídeos da comunidade",
    texto: "Projetos, testes e criações de quem acompanha as lives.",
    vazio: { titulo: "Nenhum vídeo enviado ainda", texto: "Seja a primeira pessoa a mandar o seu!" },
  },
};

export async function paginaListagem(alvo, colecao, query) {
  const t = TEXTOS[colecao];
  const ehVideo = colecao === "cortes" || colecao === "comunidade";
  const extra = colecao === "comunidade"
    ? `<a class="botao" href="#/enviar">${icone("enviar")} Enviar meu vídeo</a>` : "";
  alvo.innerHTML = cabecalho({ ...t, extra }) + `<div class="filtros-wrap"></div><div class="resultado"></div>`;
  const resultado = alvo.querySelector(".resultado");
  resultado.innerHTML = esqueleto(6, ehVideo ? "video" : "resumo");

  let itens;
  try {
    [itens] = await Promise.all([carregarColecao(colecao), carregarConfig()]);
  } catch (e) {
    resultado.innerHTML = erro(e);
    return;
  }

  const estado = {
    q: query.get("q") || "", categoria: query.get("categoria") || "", tag: query.get("tag") || "",
    periodo: query.get("periodo") || "todos", ordem: query.get("ordem") || "recentes",
  };

  function desenhar(e) {
    atualizarQuery({ q: e.q, categoria: e.categoria, tag: e.tag, periodo: e.periodo !== "todos" && e.periodo, ordem: e.ordem !== "recentes" && e.ordem });
    let lista = filtrar(itens, e);
    if (e.q) {
      const achados = new Set(buscar(lista, e.q));
      lista = e.ordem === "antigos" || !e.q ? lista.filter(i => achados.has(i)) : [...achados];
    }
    const filtrando = e.q || e.categoria || e.tag || e.periodo !== "todos";
    resultado.innerHTML = lista.length
      ? `<p class="contagem" aria-live="polite">${lista.length} ${lista.length === 1 ? "publicação" : "publicações"}</p>
         <div class="grade grade--${ehVideo ? "video" : "resumo"}">${lista.map(cardPara).join("")}</div>`
      : vazio({
          ...t.vazio,
          acao: filtrando ? { href: "#/" + colecao, texto: "Limpar filtros" } : (colecao === "comunidade" ? { href: "#/enviar", texto: "Como enviar um vídeo" } : null),
        });
  }

  montarFiltros(alvo.querySelector(".filtros-wrap"), itens, estado, desenhar);
  desenhar(estado);
}
