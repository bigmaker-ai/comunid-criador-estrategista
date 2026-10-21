import "./styles/main.css";
import { carregarConfig } from "./lib/data.js";
import { iniciarRoteador, rota, rotaNaoEncontrada } from "./lib/router.js";
import { paginaHome } from "./pages/home.js";
import { paginaListagem } from "./pages/listagem.js";
import { paginaVideo } from "./pages/video.js";
import { paginaLive } from "./pages/live.js";
import { paginaWhatsapp } from "./pages/whatsapp.js";
import { paginaBusca, paginaEnviar, paginaNaoEncontrada, paginaSobre } from "./pages/simples.js";

rota("/", alvo => paginaHome(alvo));
rota("/cortes", (alvo, _, q) => paginaListagem(alvo, "cortes", q));
rota("/cortes/:slug", (alvo, p) => paginaVideo(alvo, "cortes", p.slug));
rota("/lives", (alvo, _, q) => paginaListagem(alvo, "lives", q));
rota("/lives/:slug", (alvo, p, q) => paginaLive(alvo, p.slug, q));
rota("/whatsapp", (alvo, _, q) => paginaListagem(alvo, "whatsapp", q));
rota("/whatsapp/:slug", (alvo, p) => paginaWhatsapp(alvo, p.slug));
rota("/comunidade", (alvo, _, q) => paginaListagem(alvo, "comunidade", q));
rota("/comunidade/:slug", (alvo, p) => paginaVideo(alvo, "comunidade", p.slug));
rota("/busca", (alvo, _, q) => paginaBusca(alvo, q));
rota("/enviar", alvo => paginaEnviar(alvo));
rota("/sobre", alvo => paginaSobre(alvo));
rotaNaoEncontrada(alvo => paginaNaoEncontrada(alvo));

const main = document.getElementById("conteudo");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menu-btn");
let nomeSite = "Criadores do Futuro";
let rotaAnterior = null;

carregarConfig().then(c => {
  nomeSite = c.nome || nomeSite;
  document.querySelectorAll('[data-config="nome"]').forEach(el => { el.textContent = nomeSite; });
}).catch(() => {});

iniciarRoteador(main, caminho => {
  const secao = caminho.split("/")[1] || "";
  nav.querySelectorAll("a").forEach(a => {
    if (a.dataset.nav === secao) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  nav.classList.remove("aberto");
  menuBtn.setAttribute("aria-expanded", "false");
  document.title = nomeSite;
  // só volta ao topo quando muda de página (não ao mexer em filtros)
  if (caminho !== rotaAnterior) {
    window.scrollTo(0, 0);
    if (rotaAnterior !== null) main.focus({ preventScroll: true });
  }
  rotaAnterior = caminho;
  main.classList.remove("entrando");
  void main.offsetWidth;
  main.classList.add("entrando");
});

menuBtn.addEventListener("click", () => {
  const aberto = nav.classList.toggle("aberto");
  menuBtn.setAttribute("aria-expanded", String(aberto));
});

// busca global no topo
const buscaTopo = document.getElementById("busca-topo");
buscaTopo.addEventListener("submit", e => {
  e.preventDefault();
  const q = buscaTopo.querySelector("input").value.trim();
  location.hash = "#/busca" + (q ? "?q=" + encodeURIComponent(q) : "");
  buscaTopo.querySelector("input").blur();
});
document.addEventListener("keydown", e => {
  if (e.key === "/" && !e.target.closest("input, textarea, select, [contenteditable], .player")) {
    e.preventDefault();
    buscaTopo.querySelector("input").focus();
  }
});

// sombra no cabeçalho ao rolar
const topo = document.getElementById("topo");
addEventListener("scroll", () => topo.classList.toggle("rolado", scrollY > 8), { passive: true });
