import "./styles/main.css";
import { iniciarRoteador, rota, rotaNaoEncontrada } from "./lib/router.js";
import { paginaHome } from "./pages/home.js";
import { paginaLive } from "./pages/live.js";
import { paginaVideo } from "./pages/video.js";
import { paginaGaleria } from "./pages/galeria.js";
import { vazio } from "./components/ui.js";
import { icone } from "./components/icones.js";

rota("/", alvo => paginaHome(alvo));
rota("/lives", alvo => paginaHome(alvo));
rota("/lives/:slug", (alvo, p, q) => paginaLive(alvo, p.slug, q));
rota("/cortes/:slug", (alvo, p) => paginaVideo(alvo, p.slug));
rota("/galeria", (alvo, _, q) => paginaGaleria(alvo, q));
rotaNaoEncontrada(alvo => {
  alvo.innerHTML = vazio({ titulo: "Página não encontrada", texto: "O endereço pode ter mudado.", acao: { href: "#/", texto: "Ver as lives" } });
});

const main = document.getElementById("conteudo");
const NOME = "Resumos das lives · Criadores do Futuro";
let rotaAnterior = null;

const nav = document.getElementById("nav");
const lateral = document.getElementById("lateral");
const fundo = document.getElementById("lateral-fundo");
const menuBtn = document.getElementById("menu-btn");
const marca = document.getElementById("marca");
nav.querySelectorAll("[data-icone]").forEach(el => { el.outerHTML = icone(el.dataset.icone); });

// cada área do site tem a sua marca no topo
const AREAS = {
  lives: { selo: "✺", rotulo: "Resumos das lives", href: "#/" },
  galeria: { selo: "▶", rotulo: "Galeria do grupo", href: "#/galeria" },
};

function menu(aberto) {
  lateral.classList.toggle("aberto", aberto);
  fundo.hidden = !aberto;
  menuBtn.setAttribute("aria-expanded", String(aberto));
}
menuBtn.addEventListener("click", () => menu(!lateral.classList.contains("aberto")));
fundo.addEventListener("click", () => menu(false));
document.getElementById("lateral-fechar").addEventListener("click", () => menu(false));

iniciarRoteador(main, caminho => {
  document.title = NOME;
  const secao = caminho.startsWith("/galeria") ? "galeria" : "lives";
  nav.querySelectorAll("a").forEach(a => {
    if (a.dataset.nav === secao) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  document.body.dataset.area = secao;
  marca.href = AREAS[secao].href;
  marca.querySelector(".marca__selo").textContent = AREAS[secao].selo;
  marca.querySelector("small").textContent = AREAS[secao].rotulo;
  menu(false);
  // só volta ao topo quando muda de página
  if (caminho !== rotaAnterior) {
    window.scrollTo(0, 0);
    if (rotaAnterior !== null) main.focus({ preventScroll: true });
  }
  rotaAnterior = caminho;
  main.classList.remove("entrando");
  void main.offsetWidth;
  main.classList.add("entrando");
});

// sombra no cabeçalho ao rolar
const topo = document.getElementById("topo");
addEventListener("scroll", () => topo.classList.toggle("rolado", scrollY > 8), { passive: true });
