import { test } from "node:test";
import assert from "node:assert/strict";
import { buscar, filtrar, opcoes } from "../src/lib/search.js";
import { dataCurta, normalizar, paraSegundos, slugify, tempo } from "../src/lib/format.js";

const itens = [
  { id: "a", titulo: "Roteiro em 3 passos", descricao: "Como escrever", categoria: "Roteiro", data: "2026-10-14", tags: ["roteiro", "gancho"] },
  { id: "b", titulo: "Edição no CapCut", descricao: "Cortes rápidos e legenda", categoria: "Edição", data: "2026-10-01", tags: ["capcut"] },
  { id: "c", titulo: "Bastidores", descricao: "Um roteiro improvisado", categoria: "Bastidores", data: "2026-09-20", tags: ["roteiro"] },
];

test("busca ignora acento e caixa, e título vale mais que descrição", () => {
  assert.deepEqual(buscar(itens, "ROTEIRO").map(i => i.id), ["a", "c"]);
  assert.deepEqual(buscar(itens, "edicao").map(i => i.id), ["b"]);
});

test("busca exige todos os termos", () => {
  assert.deepEqual(buscar(itens, "roteiro improvisado").map(i => i.id), ["c"]);
  assert.deepEqual(buscar(itens, "roteiro capcut"), []);
});

test("busca vazia devolve tudo", () => {
  assert.equal(buscar(itens, "  ").length, 3);
});

test("filtra por categoria, tag, mês e período", () => {
  const hoje = new Date(2026, 9, 15);
  assert.deepEqual(filtrar(itens, { categoria: "Edição" }, hoje).map(i => i.id), ["b"]);
  assert.deepEqual(filtrar(itens, { tag: "roteiro" }, hoje).map(i => i.id), ["a", "c"]);
  assert.deepEqual(filtrar(itens, { periodo: "2026-10" }, hoje).map(i => i.id), ["a", "b"]);
  assert.deepEqual(filtrar(itens, { periodo: "7" }, hoje).map(i => i.id), ["a"]);
  assert.deepEqual(filtrar(itens, { periodo: "30" }, hoje).map(i => i.id), ["a", "b", "c"]);
  assert.deepEqual(filtrar(itens, { ordem: "antigos" }, hoje).map(i => i.id), ["c", "b", "a"]);
});

test("opções de filtro", () => {
  const o = opcoes(itens);
  assert.deepEqual(o.categorias, ["Bastidores", "Edição", "Roteiro"]);
  assert.equal(o.tags[0], "roteiro");
  assert.deepEqual(o.meses, ["2026-10", "2026-09"]);
});

test("formatação de tempo e datas", () => {
  assert.equal(paraSegundos("1:02:03"), 3723);
  assert.equal(paraSegundos("02:03"), 123);
  assert.equal(tempo(3723), "1:02:03");
  assert.equal(tempo(65), "1:05");
  assert.equal(dataCurta("2026-01-05"), "05/01/2026");
  assert.equal(normalizar("Ação"), "acao");
  assert.equal(slugify("Aula 01: Guia inicial!"), "aula-01-guia-inicial");
});
