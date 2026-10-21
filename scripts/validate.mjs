// Confere o conteúdo em public/content antes de publicar:
// campos obrigatórios, datas, slugs/ids únicos, arquivos que existem, relacionados válidos
// e nada de telefone nos resumos do WhatsApp.
//   npm run validate
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const CONTEUDO = join(RAIZ, "content");
const COLECOES = ["cortes", "lives", "whatsapp", "comunidade"];
const OBRIGATORIOS = ["id", "titulo", "slug", "categoria", "data", "descricao"];
const TELEFONE = /(\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/;

const erros = [];
const avisos = [];
const erro = (onde, msg) => erros.push(`✗ ${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`! ${onde}: ${msg}`);

function lerJson(arquivo) {
  try {
    return JSON.parse(readFileSync(join(CONTEUDO, arquivo), "utf8"));
  } catch (e) {
    erro(arquivo, "JSON inválido ou ausente: " + e.message);
    return null;
  }
}

const arquivoLocalExiste = caminho => !caminho || /^(https?:)?\/\//.test(caminho) || caminho.startsWith("#") || existsSync(join(RAIZ, caminho));

const config = lerJson("config.json") || {};
const grupos = new Set((config.grupos || []).map(g => g.id));
const todosIds = new Set();
const todos = [];

for (const nome of COLECOES) {
  const dados = lerJson(`${nome}.json`);
  if (!dados) continue;
  if (!Array.isArray(dados.itens)) { erro(`${nome}.json`, 'precisa ter a lista "itens"'); continue; }
  const slugs = new Set();
  for (const [i, item] of dados.itens.entries()) {
    const onde = `${nome}.json #${i + 1} (${item.slug || item.id || "sem slug"})`;
    for (const campo of OBRIGATORIOS) if (!item[campo]) erro(onde, `campo obrigatório "${campo}" vazio`);
    if (item.data && !/^\d{4}-\d{2}-\d{2}$/.test(item.data)) erro(onde, `data "${item.data}" deve ser AAAA-MM-DD`);
    if (item.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) erro(onde, "slug só pode ter letras minúsculas sem acento, números e hífen");
    if (slugs.has(item.slug)) erro(onde, `slug repetido "${item.slug}"`);
    slugs.add(item.slug);
    if (todosIds.has(item.id)) erro(onde, `id repetido "${item.id}"`);
    todosIds.add(item.id);
    if (item.tags && !Array.isArray(item.tags)) erro(onde, '"tags" deve ser uma lista');
    if (!arquivoLocalExiste(item.miniatura)) erro(onde, `miniatura não encontrada: ${item.miniatura}`);
    if (item.video && !/^https?:/.test(item.video) && !arquivoLocalExiste(item.video)) erro(onde, `vídeo não encontrado: ${item.video}`);
    if ((nome === "cortes" || nome === "comunidade") && !item.video) aviso(onde, "sem vídeo (vai aparecer “Vídeo ainda não disponível”)");
    if (nome === "lives") {
      if (item.conteudo && !existsSync(join(CONTEUDO, item.conteudo))) erro(onde, `markdown não encontrado: content/${item.conteudo}`);
      for (const c of item.capitulos || []) {
        if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(c.t)) erro(onde, `capítulo com tempo inválido "${c.t}"`);
      }
    }
    if (nome === "whatsapp") {
      if (item.grupo && !grupos.has(item.grupo)) erro(onde, `grupo "${item.grupo}" não existe em config.json`);
      const texto = JSON.stringify(item);
      if (TELEFONE.test(texto)) erro(onde, "parece conter um número de telefone: remova antes de publicar");
      for (const t of item.topicos || []) for (const m of t.mensagens || []) {
        if (m.autor && m.autorizado !== true) erro(onde, `autor "${m.autor}" sem "autorizado": true (não será exibido)`);
      }
    }
    todos.push({ onde, item });
  }
}

for (const { onde, item } of todos) {
  for (const id of item.relacionados || []) if (!todosIds.has(id)) erro(onde, `relacionado "${id}" não existe`);
}

if (avisos.length) console.log(avisos.join("\n"));
if (erros.length) {
  console.error(erros.join("\n"));
  console.error(`\n${erros.length} problema(s) no conteúdo.`);
  process.exit(1);
}
console.log(`✓ Conteúdo válido: ${todos.length} publicações.`);
