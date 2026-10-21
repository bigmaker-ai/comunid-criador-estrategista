// Confere o conteúdo em public/content antes de publicar:
// campos obrigatórios, datas, slugs/ids únicos, arquivos que existem, tempos válidos
// e cortes da live que existem em cortes.json.
//   npm run validate
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const CONTEUDO = join(RAIZ, "content");
const OBRIGATORIOS = ["id", "titulo", "slug", "data", "descricao"];
const TEMPO = /^\d{1,2}:\d{2}(:\d{2})?$/;

const erros = [];
const erro = (onde, msg) => erros.push(`✗ ${onde}: ${msg}`);

function lerJson(arquivo) {
  try {
    return JSON.parse(readFileSync(join(CONTEUDO, arquivo), "utf8"));
  } catch (e) {
    erro(arquivo, "JSON inválido ou ausente: " + e.message);
    return { itens: [] };
  }
}

const arquivoExiste = caminho => !caminho || /^(https?:)?\/\//.test(caminho) || caminho.startsWith("#") || existsSync(join(RAIZ, caminho));

function conferir(nome, itens, ids) {
  const slugs = new Set();
  for (const [i, item] of itens.entries()) {
    const onde = `${nome} #${i + 1} (${item.slug || item.id || "sem slug"})`;
    for (const campo of OBRIGATORIOS) if (!item[campo]) erro(onde, `campo obrigatório "${campo}" vazio`);
    if (item.data && !/^\d{4}-\d{2}-\d{2}$/.test(item.data)) erro(onde, `data "${item.data}" deve ser AAAA-MM-DD`);
    if (item.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) erro(onde, "slug só pode ter letras minúsculas sem acento, números e hífen");
    if (slugs.has(item.slug)) erro(onde, `slug repetido "${item.slug}"`);
    slugs.add(item.slug);
    if (ids.has(item.id)) erro(onde, `id repetido "${item.id}"`);
    ids.add(item.id);
    if (!arquivoExiste(item.miniatura)) erro(onde, `miniatura não encontrada: ${item.miniatura}`);
    if (item.video && !arquivoExiste(item.video)) erro(onde, `vídeo não encontrado: ${item.video}`);
  }
}

const lives = lerJson("lives.json").itens || [];
const cortes = lerJson("cortes.json").itens || [];
const ids = new Set();
conferir("lives.json", lives, ids);
conferir("cortes.json", cortes, ids);

const idsCortes = new Set(cortes.map(c => c.id));
for (const live of lives) {
  const onde = `lives.json (${live.slug})`;
  for (const c of live.capitulos || []) if (!TEMPO.test(c.t)) erro(onde, `capítulo com tempo inválido "${c.t}"`);
  for (const t of live.tarefas || []) {
    if (!t.texto) erro(onde, "tarefa sem texto");
    if (t.t && !TEMPO.test(t.t)) erro(onde, `tarefa com tempo inválido "${t.t}"`);
  }
  for (const id of live.cortes || []) if (!idsCortes.has(id)) erro(onde, `corte "${id}" não existe em cortes.json`);
}
for (const c of cortes) if (!c.video) erro(`cortes.json (${c.slug})`, "corte sem vídeo");

if (erros.length) {
  console.error(erros.join("\n"));
  console.error(`\n${erros.length} problema(s) no conteúdo.`);
  process.exit(1);
}
console.log(`✓ Conteúdo válido: ${lives.length} live(s), ${cortes.length} corte(s).`);
