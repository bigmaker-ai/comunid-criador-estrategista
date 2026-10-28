// Carrega o conteúdo de public/content/*.json (sem servidor: é tudo arquivo estático).

const BASE = import.meta.env.BASE_URL;

export const COLECOES = {
  lives: { arquivo: "lives.json", rota: "lives" },
  cortes: { arquivo: "cortes.json", rota: "cortes" },
};

const cache = new Map();

/** Caminho de arquivo do site (miniatura, vídeo) -> URL. Links externos passam direto. */
export function urlDe(caminho) {
  if (!caminho) return "";
  if (/^(https?:)?\/\//.test(caminho) || caminho.startsWith("data:")) return caminho;
  return BASE + caminho.replace(/^\.?\//, "");
}

function buscarJson(caminho) {
  if (cache.has(caminho)) return cache.get(caminho);
  const promessa = fetch(urlDe(caminho), { cache: "no-cache" }).then(r => {
    if (!r.ok) throw new Error(`Não consegui carregar ${caminho} (${r.status})`);
    return r.json();
  });
  cache.set(caminho, promessa);
  promessa.catch(() => cache.delete(caminho));
  return promessa;
}

export async function carregarColecao(nome) {
  const dados = await buscarJson("content/" + COLECOES[nome].arquivo);
  return (dados.itens || [])
    .filter(i => i.publicado !== false)
    .map(i => ({ ...i, colecao: nome, href: `#/${COLECOES[nome].rota}/${i.slug}` }))
    .sort((a, b) => String(b.data).localeCompare(String(a.data)));
}

export async function porSlug(nome, slug) {
  return (await carregarColecao(nome)).find(i => i.slug === slug) || null;
}

/** Vídeos da galeria do grupo (public/content/galeria.json). */
export async function carregarGaleria() {
  const dados = await buscarJson("content/galeria.json");
  return (dados.itens || []).filter(v => v.publicado !== false && v.video);
}

/** Cortes de uma live, na ordem em que aparecem na live. */
export async function cortesDaLive(live) {
  const cortes = await carregarColecao("cortes");
  return (live.cortes || []).map(id => cortes.find(c => c.id === id)).filter(Boolean);
}
