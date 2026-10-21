// Busca global, envio de vídeo, sobre/privacidade e página não encontrada.
import { carregarConfig, carregarMarkdown, carregarTudo, COLECOES } from "../lib/data.js";
import { escapar } from "../lib/format.js";
import { atualizarQuery } from "../lib/router.js";
import { buscar } from "../lib/search.js";
import { cabecalho, erro, itemLista, vazio } from "../components/ui.js";
import { icone } from "../components/icones.js";

let textoLives = null;
/** Inclui o texto completo dos resumos das lives na busca (carregado uma vez). */
async function comTextoCompleto(tudo) {
  if (!textoLives) {
    textoLives = new Map();
    await Promise.all(tudo.lives.filter(l => l.conteudo).map(async l => {
      try { textoLives.set(l.id, await carregarMarkdown(l.conteudo)); } catch { /* segue sem o texto */ }
    }));
  }
  const extra = item => {
    if (item.colecao === "lives") return [textoLives.get(item.id), (item.capitulos || []).map(c => c.titulo + " " + (c.resumo || "")).join(" ")].join(" ");
    if (item.colecao === "whatsapp") return (item.topicos || []).map(t => t.titulo + " " + t.resumo).join(" ");
    return item.conteudo || "";
  };
  return Object.values(tudo).flat().map(i => ({ ...i, textoBusca: extra(i) }));
}

export async function paginaBusca(alvo, query) {
  const q = query.get("q") || "";
  alvo.innerHTML = cabecalho({ eyebrow: "Busca", titulo: "Buscar no portal" }) + `
    <form class="filtros" role="search" id="form-busca">
      <label class="campo-busca">${icone("busca")}<span class="sr">Termo de busca</span>
        <input type="search" name="q" value="${escapar(q)}" placeholder="Ex.: roteiro, CapCut, edição…" autofocus autocomplete="off"></label>
    </form>
    <div class="resultado"></div>`;
  const resultado = alvo.querySelector(".resultado");
  let itens;
  try {
    itens = await comTextoCompleto(await carregarTudo());
  } catch (e) {
    resultado.innerHTML = erro(e);
    return;
  }
  const desenhar = termo => {
    atualizarQuery({ q: termo });
    if (!termo.trim()) {
      resultado.innerHTML = vazio({ titulo: "O que você procura?", texto: "Busque em cortes, resumos das lives, resumos do WhatsApp e vídeos da comunidade." });
      return;
    }
    const achados = buscar(itens, termo);
    if (!achados.length) {
      resultado.innerHTML = vazio({ titulo: `Nada encontrado para “${termo}”`, texto: "Tente uma palavra mais curta ou um sinônimo." });
      return;
    }
    const grupos = Object.keys(COLECOES).map(c => [c, achados.filter(i => i.colecao === c)]).filter(([, l]) => l.length);
    resultado.innerHTML = `<p class="contagem" aria-live="polite">${achados.length} resultado(s)</p>` + grupos.map(([c, l]) =>
      `<section class="grupo-busca"><h2>${COLECOES[c].nome} <span>${l.length}</span></h2><ul class="lista">${l.map(itemLista).join("")}</ul></section>`).join("");
  };
  let timer;
  const input = alvo.querySelector("input");
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => desenhar(input.value), 150); });
  alvo.querySelector("form").addEventListener("submit", e => { e.preventDefault(); desenhar(input.value); });
  desenhar(q);
}

export async function paginaEnviar(alvo) {
  const config = await carregarConfig().catch(() => ({}));
  const form = config.formularioEnvio;
  alvo.innerHTML = cabecalho({
    eyebrow: "Vídeos da comunidade", titulo: "Como enviar o seu vídeo",
    texto: "O portal não recebe arquivos diretamente: você manda o link pelo formulário, a equipe revisa e publica na galeria.",
  }) + `
  <div class="passos">
    <ol>
      <li><span class="passo__n">1</span><div><h3>Publique o vídeo em um link</h3>
        <p>Envie para o <strong>YouTube</strong> (pode ser “não listado”) ou para o <strong>Google Drive</strong> com acesso “Qualquer pessoa com o link”.</p></div></li>
      <li><span class="passo__n">2</span><div><h3>Preencha o formulário</h3>
        <p>Informe o link, um título, uma descrição curta e, se quiser, um apelido para os créditos. Não precisa informar telefone.</p></div></li>
      <li><span class="passo__n">3</span><div><h3>Revisão</h3>
        <p>A equipe confere se o vídeo segue as regras da comunidade e publica na galeria. Você pode pedir a remoção a qualquer momento.</p></div></li>
    </ol>
    <div class="passos__cta">
      ${form
        ? `<a class="botao botao--grande" href="${escapar(form)}" target="_blank" rel="noopener">${icone("enviar")} Abrir formulário de envio</a>`
        : `<p class="aviso">O formulário de envio ainda não foi configurado. (Para quem administra: preencha <code>formularioEnvio</code> em <code>public/content/config.json</code>.)</p>`}
      <ul class="regras">
        <li>Só envie vídeos que você mesmo fez ou tem permissão para compartilhar.</li>
        <li>Não mostre dados pessoais de outras pessoas (telefone, endereço, documentos).</li>
        <li>Ao enviar, você autoriza a exibição do vídeo e do apelido informado neste portal.</li>
      </ul>
    </div>
  </div>`;
}

export async function paginaSobre(alvo) {
  const config = await carregarConfig().catch(() => ({}));
  alvo.innerHTML = cabecalho({ eyebrow: "Sobre", titulo: "Sobre o portal", texto: config.descricao || "" }) + `
  <div class="prosa prosa--estreita">
    <h2>Para que serve</h2>
    <p>Para quem perdeu uma live ou não conseguiu acompanhar o grupo ficar por dentro de tudo em poucos minutos, e depois assistir à live completa com o guia de navegação.</p>
    <h2>Privacidade nos resumos do WhatsApp</h2>
    <ul>
      <li>Nunca publicamos números de telefone, fotos de perfil ou dados pessoais.</li>
      <li>Trechos de mensagens aparecem sem o nome de quem escreveu, a não ser que a pessoa autorize.</li>
      <li>Quer que algo seja removido? Fale com a moderação no grupo.</li>
    </ul>
    <h2>Conteúdo de demonstração</h2>
    <p>Publicações marcadas com <span class="selo selo--demo">Demonstração</span> são exemplos fictícios para mostrar como o portal funciona. Elas não descrevem acontecimentos reais.</p>
  </div>`;
}

export function paginaNaoEncontrada(alvo) {
  alvo.innerHTML = vazio({ titulo: "Página não encontrada", texto: "O endereço pode ter mudado. Que tal voltar ao início?", acao: { href: "#/", texto: "Ir para o início" } });
}
