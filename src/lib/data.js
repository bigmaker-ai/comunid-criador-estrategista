// Carrega o conteúdo de public/content/*.json e *.md (sem servidor: é tudo arquivo estático).

const BASE = import.meta.env.BASE_URL;

export const COLECOES = {
  cortes: { arquivo: "cortes.json", rota: "cortes", nome: "Cortes", singular: "Corte" },
  lives: { arquivo: "lives.json", rota: "lives", nome: "Resumos das lives", singular: "Resumo de live" },
  whatsapp: { arquivo: "whatsapp.json", rota: "whatsapp", nome: "Resumos do WhatsApp", singular: "Resumo do WhatsApp" },
  comunidade: { arquivo: "comunidade.json", rota: "comunidade", nome: "Vídeos da comunidade", singular: "Vídeo da comunidade" },
};

const cache = new Map();

/** Caminho de arquivo do site (miniatura, vídeo, markdown) -> URL. Links externos passam direto. */
export function urlDe(caminho) {
  if (!caminho) return "";
  if (/^(https?:)?\/\//.test(caminho) || caminho.startsWith("data:")) return caminho;
  return BASE + caminho.replace(/^\.?\//, "");
}

async function buscarArquivo(caminho, tipo = "json") {
  if (cache.has(caminho)) return cache.get(caminho);
  const promessa = fetch(urlDe(caminho), { cache: "no-cache" }).then(r => {
    if (!r.ok) throw new Error(`Não consegui carregar ${caminho} (${r.status})`);
    return tipo === "json" ? r.json() : r.text();
  });
  cache.set(caminho, promessa);
  promessa.catch(() => cache.delete(caminho));
  return promessa;
}

export function carregarConfig() {
  return buscarArquivo("content/config.json");
}

export async function carregarColecao(nome) {
  const dados = await buscarArquivo("content/" + COLECOES[nome].arquivo);
  return (dados.itens || [])
    .filter(i => i.publicado !== false)
    .map(i => ({ ...i, colecao: nome, href: `#/${COLECOES[nome].rota}/${i.slug}` }))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));
}

export async function carregarTudo() {
  const nomes = Object.keys(COLECOES);
  const listas = await Promise.all(nomes.map(carregarColecao));
  return Object.fromEntries(nomes.map((n, i) => [n, listas[i]]));
}

export async function porSlug(nome, slug) {
  return (await carregarColecao(nome)).find(i => i.slug === slug) || null;
}

/** Publicações relacionadas (por id, em qualquer coleção). */
export async function relacionados(ids = []) {
  if (!ids.length) return [];
  const tudo = Object.values(await carregarTudo()).flat();
  return ids.map(id => tudo.find(i => i.id === id)).filter(Boolean);
}

export function carregarMarkdown(caminho) {
  return buscarArquivo("content/" + caminho, "text");
}
