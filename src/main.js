import "./styles/main.css";
import { iniciarRoteador, rota, rotaNaoEncontrada } from "./lib/router.js";
import { paginaHome } from "./pages/home.js";
import { paginaLive } from "./pages/live.js";
import { paginaVideo } from "./pages/video.js";
import { vazio } from "./components/ui.js";

rota("/", alvo => paginaHome(alvo));
rota("/lives", alvo => paginaHome(alvo));
rota("/lives/:slug", (alvo, p, q) => paginaLive(alvo, p.slug, q));
rota("/cortes/:slug", (alvo, p) => paginaVideo(alvo, p.slug));
rotaNaoEncontrada(alvo => {
  alvo.innerHTML = vazio({ titulo: "Página não encontrada", texto: "O endereço pode ter mudado.", acao: { href: "#/", texto: "Ver as lives" } });
});

const main = document.getElementById("conteudo");
const NOME = "Resumos das lives · Criadores do Futuro";
let rotaAnterior = null;

iniciarRoteador(main, caminho => {
  document.title = NOME;
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
