// Player de vídeo com controle de velocidade.
// Aceita: arquivo .mp4/.webm (do próprio site ou link direto), YouTube, Google Drive e links de outras plataformas.
import { urlDe } from "../lib/data.js";
import { escapar, tempo } from "../lib/format.js";
import { icone } from "./icones.js";

export const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** Descobre o tipo de fonte a partir do link. */
export function detectarFonte(link) {
  if (!link) return null;
  const yt = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { tipo: "youtube", id: yt[1], url: `https://www.youtube.com/watch?v=${yt[1]}` };
  const drive = link.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/);
  if (drive) return { tipo: "drive", id: drive[1], url: `https://drive.google.com/file/d/${drive[1]}/view` };
  if (/\.(mp4|webm|m4v|mov)(\?|#|$)/i.test(link) || !/^https?:/i.test(link)) return { tipo: "arquivo", url: urlDe(link) };
  return { tipo: "link", url: link };
}

function velocidadeSalva() {
  try { return Number(localStorage.getItem("velocidade")) || 1; } catch { return 1; }
}
function salvarVelocidade(v) {
  try { localStorage.setItem("velocidade", String(v)); } catch { /* modo privado */ }
}
const rotuloVel = v => String(v).replace(".", ",") + "x";

function seletorVelocidade(aoEscolher) {
  const el = document.createElement("div");
  el.className = "vel";
  el.innerHTML = `<button type="button" class="vel__btn" aria-haspopup="true" aria-expanded="false" title="Velocidade">${rotuloVel(velocidadeSalva())}</button>
    <div class="vel__menu" role="menu">${VELOCIDADES.map(v => `<button type="button" role="menuitemradio" data-v="${v}">${rotuloVel(v)}</button>`).join("")}</div>`;
  const btn = el.querySelector(".vel__btn");
  const marcar = v => {
    btn.textContent = rotuloVel(v);
    el.querySelectorAll("[data-v]").forEach(b => b.setAttribute("aria-checked", String(Number(b.dataset.v) === v)));
  };
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const aberto = el.classList.toggle("aberto");
    btn.setAttribute("aria-expanded", String(aberto));
  });
  el.querySelector(".vel__menu").addEventListener("click", e => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    e.stopPropagation();
    const v = Number(b.dataset.v);
    salvarVelocidade(v);
    marcar(v);
    aoEscolher(v);
    el.classList.remove("aberto");
    btn.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("click", () => el.classList.remove("aberto"));
  marcar(velocidadeSalva());
  return { el, marcar };
}

/* ---------- arquivo de vídeo: controles próprios ---------- */
function playerArquivo(alvo, fonte, opts) {
  const raiz = document.createElement("div");
  raiz.className = "player";
  raiz.tabIndex = 0;
  raiz.setAttribute("aria-label", "Player: " + (opts.titulo || "vídeo") + ". Espaço reproduz, setas avançam, < e > mudam a velocidade.");
  raiz.innerHTML = `
    <video preload="metadata" playsinline ${opts.miniatura ? `poster="${escapar(urlDe(opts.miniatura))}"` : ""} src="${escapar(fonte.url)}"></video>
    <button type="button" class="player__grande" aria-label="Reproduzir">${icone("play")}</button>
    <div class="player__aviso" aria-hidden="true"></div>
    <div class="player__controles">
      <input class="player__progresso" type="range" min="0" max="1000" value="0" step="1" aria-label="Posição do vídeo">
      <div class="player__linha">
        <button type="button" class="player__btn" data-acao="play" aria-label="Reproduzir">${icone("play")}</button>
        <button type="button" class="player__btn" data-acao="voltar" aria-label="Voltar 10 segundos">${icone("voltar10")}</button>
        <button type="button" class="player__btn" data-acao="avancar" aria-label="Avançar 10 segundos">${icone("avancar10")}</button>
        <span class="player__tempo"><span data-atual>0:00</span> / <span data-total>0:00</span></span>
        <span class="player__espaco"></span>
        <span class="player__vel"></span>
        <button type="button" class="player__btn" data-acao="som" aria-label="Silenciar">${icone("som")}</button>
        <button type="button" class="player__btn" data-acao="tela" aria-label="Tela cheia">${icone("tela")}</button>
      </div>
    </div>`;
  alvo.replaceChildren(raiz);
  const video = raiz.querySelector("video");
  const progresso = raiz.querySelector(".player__progresso");
  const aviso = raiz.querySelector(".player__aviso");
  const btnPlay = raiz.querySelector('[data-acao="play"]');
  const btnSom = raiz.querySelector('[data-acao="som"]');
  const vel = seletorVelocidade(v => { video.playbackRate = v; avisar(rotuloVel(v)); });
  raiz.querySelector(".player__vel").append(vel.el);
  video.playbackRate = velocidadeSalva();
  video.addEventListener("loadedmetadata", () => {
    video.playbackRate = velocidadeSalva();
    raiz.querySelector("[data-total]").textContent = tempo(video.duration);
    if (opts.inicio) video.currentTime = opts.inicio;
  });

  let avisoTimer;
  function avisar(texto) {
    aviso.textContent = texto;
    aviso.classList.add("visivel");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove("visivel"), 700);
  }
  // mantém o foco no player para os atalhos de teclado continuarem funcionando depois do clique
  const alternar = () => { raiz.focus({ preventScroll: true }); return video.paused ? video.play() : video.pause(); };
  const pular = s => { video.currentTime = Math.min(Math.max(0, video.currentTime + s), video.duration || 0); avisar((s > 0 ? "+" : "") + s + "s"); };
  const mudarVel = passo => {
    const i = VELOCIDADES.indexOf(video.playbackRate);
    const v = VELOCIDADES[Math.min(Math.max(0, (i < 0 ? 2 : i) + passo), VELOCIDADES.length - 1)];
    video.playbackRate = v; salvarVelocidade(v); vel.marcar(v); avisar(rotuloVel(v));
  };

  video.addEventListener("play", () => { raiz.dataset.estado = "tocando"; btnPlay.innerHTML = icone("pause"); btnPlay.setAttribute("aria-label", "Pausar"); });
  video.addEventListener("pause", () => { raiz.dataset.estado = "pausado"; btnPlay.innerHTML = icone("play"); btnPlay.setAttribute("aria-label", "Reproduzir"); });
  video.addEventListener("timeupdate", () => {
    raiz.querySelector("[data-atual]").textContent = tempo(video.currentTime);
    if (video.duration) {
      progresso.value = Math.round((video.currentTime / video.duration) * 1000);
      progresso.style.setProperty("--p", progresso.value / 10 + "%");
    }
  });
  video.addEventListener("volumechange", () => { btnSom.innerHTML = icone(video.muted ? "mudo" : "som"); });
  progresso.addEventListener("input", () => { if (video.duration) video.currentTime = (progresso.value / 1000) * video.duration; });
  video.addEventListener("click", alternar);
  video.addEventListener("dblclick", () => tela());
  raiz.querySelector(".player__grande").addEventListener("click", alternar);
  const tela = () => (document.fullscreenElement ? document.exitFullscreen() : raiz.requestFullscreen?.());
  raiz.querySelector(".player__linha").addEventListener("click", e => {
    const acao = e.target.closest("[data-acao]")?.dataset.acao;
    if (acao === "play") alternar();
    if (acao === "voltar") pular(-10);
    if (acao === "avancar") pular(10);
    if (acao === "som") video.muted = !video.muted;
    if (acao === "tela") tela();
  });
  raiz.addEventListener("keydown", e => {
    if (e.target.matches("input")) return;
    const k = e.key;
    if (k === " " || k === "k") { e.preventDefault(); alternar(); }
    else if (k === "ArrowRight" || k === "l") { e.preventDefault(); pular(k === "l" ? 10 : 5); }
    else if (k === "ArrowLeft" || k === "j") { e.preventDefault(); pular(k === "j" ? -10 : -5); }
    else if (k === ">" || k === ".") mudarVel(1);
    else if (k === "<" || k === ",") mudarVel(-1);
    else if (k === "f") tela();
    else if (k === "m") video.muted = !video.muted;
  });
  // esconde os controles quando o mouse para
  let ocioso;
  raiz.addEventListener("mousemove", () => {
    raiz.classList.remove("ocioso");
    clearTimeout(ocioso);
    ocioso = setTimeout(() => !video.paused && raiz.classList.add("ocioso"), 2200);
  });
  raiz.dataset.estado = "pausado";

  return {
    irPara(seg) { video.currentTime = seg; video.play(); raiz.focus({ preventScroll: true }); },
    destruir() { video.pause(); },
  };
}

/* ---------- YouTube: IFrame API (permite mudar a velocidade) ---------- */
let apiYouTube;
function carregarApiYouTube() {
  if (apiYouTube) return apiYouTube;
  apiYouTube = new Promise(resolve => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.append(s);
  });
  return apiYouTube;
}

function playerYouTube(alvo, fonte, opts) {
  const raiz = document.createElement("div");
  raiz.className = "player player--embed";
  const capa = opts.miniatura ? urlDe(opts.miniatura) : `https://i.ytimg.com/vi/${fonte.id}/hqdefault.jpg`;
  raiz.innerHTML = `
    <div class="player__fachada" style="background-image:url('${escapar(capa)}')">
      <button type="button" class="player__grande" aria-label="Reproduzir ${escapar(opts.titulo || "vídeo")}">${icone("play")}</button>
    </div>`;
  const barra = document.createElement("div");
  barra.className = "player__extra";
  barra.innerHTML = `<span class="player__vel"></span><a href="${escapar(fonte.url)}" target="_blank" rel="noopener">Abrir no YouTube ${icone("externo")}</a>`;
  alvo.replaceChildren(raiz, barra);

  let yt = null, pendente = opts.inicio || 0;
  const vel = seletorVelocidade(v => yt?.setPlaybackRate(v));
  barra.querySelector(".player__vel").append(vel.el);

  async function iniciar(autoplay = true) {
    if (yt) return yt;
    const YT = await carregarApiYouTube();
    const div = document.createElement("div");
    raiz.replaceChildren(div);
    return new Promise(resolve => {
      yt = new YT.Player(div, {
        videoId: fonte.id,
        playerVars: { autoplay: autoplay ? 1 : 0, rel: 0, playsinline: 1, start: Math.floor(pendente) },
        events: { onReady: () => { yt.setPlaybackRate(velocidadeSalva()); resolve(yt); } },
      });
    });
  }
  raiz.querySelector(".player__grande").addEventListener("click", () => iniciar());
  return {
    async irPara(seg) {
      pendente = seg;
      const p = await iniciar();
      p.seekTo(seg, true); p.playVideo();
    },
    destruir() { yt?.destroy?.(); },
  };
}

/* ---------- Google Drive (iframe do próprio Drive; velocidade pelo menu ⚙ do Drive) ---------- */
function playerDrive(alvo, fonte, opts) {
  const raiz = document.createElement("div");
  raiz.className = "player player--embed";
  raiz.innerHTML = `<div class="player__fachada" ${opts.miniatura ? `style="background-image:url('${escapar(urlDe(opts.miniatura))}')"` : ""}>
      <button type="button" class="player__grande" aria-label="Reproduzir ${escapar(opts.titulo || "vídeo")}">${icone("play")}</button></div>`;
  const barra = document.createElement("div");
  barra.className = "player__extra";
  barra.innerHTML = `<span class="player__dica">Velocidade: use o ⚙ do player do Drive</span><a href="${escapar(fonte.url)}" target="_blank" rel="noopener">Abrir no Google Drive ${icone("externo")}</a>`;
  alvo.replaceChildren(raiz, barra);
  raiz.querySelector(".player__grande").addEventListener("click", () => {
    raiz.innerHTML = `<iframe src="https://drive.google.com/file/d/${escapar(fonte.id)}/preview" allow="autoplay; fullscreen" allowfullscreen title="${escapar(opts.titulo || "Vídeo")}"></iframe>`;
  });
  return { irPara() { window.open(fonte.url, "_blank", "noopener"); }, destruir() {} };
}

/* ---------- outra plataforma: só capa + botão ---------- */
function playerLink(alvo, fonte, opts) {
  alvo.innerHTML = `<a class="player player--link" href="${escapar(fonte.url)}" target="_blank" rel="noopener"
      ${opts.miniatura ? `style="background-image:url('${escapar(urlDe(opts.miniatura))}')"` : ""}>
      <span class="player__grande" aria-hidden="true">${icone("play")}</span>
      <span class="player__rotulo">${escapar(opts.rotuloLink || "Assistir na plataforma original")} ${icone("externo")}</span>
    </a>`;
  return { irPara() { window.open(fonte.url, "_blank", "noopener"); }, destruir() {} };
}

/**
 * Monta o player em `alvo`. opts: { video, miniatura, titulo, inicio, rotuloLink }
 * Retorna { irPara(segundos), destruir() }.
 */
export function criarPlayer(alvo, opts) {
  const fonte = detectarFonte(opts.video);
  if (!fonte) {
    alvo.innerHTML = `<div class="player player--vazio">${icone("video")}<span>Vídeo ainda não disponível</span></div>`;
    return { irPara() {}, destruir() {} };
  }
  const fabrica = { arquivo: playerArquivo, youtube: playerYouTube, drive: playerDrive, link: playerLink }[fonte.tipo];
  return fabrica(alvo, fonte, opts);
}
