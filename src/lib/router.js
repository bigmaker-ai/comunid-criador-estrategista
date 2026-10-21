// Roteador por hash (#/cortes/slug?tag=x). Funciona no GitHub Pages sem configuração de servidor.

const rotas = [];
let naoEncontrada = () => {};

export function rotaNaoEncontrada(render) {
  naoEncontrada = render;
}

/** padrao: "/lives/:slug" */
export function rota(padrao, render) {
  const nomes = [];
  const regex = new RegExp("^" + padrao.replace(/:(\w+)/g, (_, n) => { nomes.push(n); return "([^/]+)"; }) + "/?$");
  rotas.push({ regex, nomes, render });
}

export function rotaAtual() {
  const bruto = location.hash.replace(/^#/, "") || "/";
  const [caminho, query = ""] = bruto.split("?");
  return { caminho, query: new URLSearchParams(query) };
}

/** Atualiza só a query (filtros) sem recarregar a página nem poluir o histórico. */
export function atualizarQuery(params) {
  const { caminho } = rotaAtual();
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const novo = "#" + caminho + (q.toString() ? "?" + q : "");
  history.replaceState(null, "", novo);
}

export function iniciarRoteador(alvo, aoMudar) {
  // (atualizarQuery usa replaceState, que não dispara hashchange: filtros não recarregam a página)
  async function resolver() {
    const { caminho, query } = rotaAtual();
    // cada página ganha um container novo: listeners da página anterior somem junto com ele
    const pagina = document.createElement("div");
    pagina.className = "pagina";
    alvo.replaceChildren(pagina);
    for (const r of rotas) {
      const m = caminho.match(r.regex);
      if (!m) continue;
      const params = Object.fromEntries(r.nomes.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
      aoMudar(caminho);
      await r.render(pagina, params, query);
      return;
    }
    aoMudar(caminho);
    await naoEncontrada(pagina, {}, query);
  }
  window.addEventListener("hashchange", resolver);
  resolver();
}
