import { test } from "node:test";
import assert from "node:assert/strict";
import { dataCurta, escapar, normalizar, paraSegundos, slugify, tempo } from "../src/lib/format.js";

test("converte tempos do guia em segundos e de volta", () => {
  assert.equal(paraSegundos("1:02:03"), 3723);
  assert.equal(paraSegundos("02:03"), 123);
  assert.equal(paraSegundos(90), 90);
  assert.equal(tempo(3723), "1:02:03");
  assert.equal(tempo(65), "1:05");
  assert.equal(tempo(-5), "0:00");
});

test("formata datas sem deslocar o dia", () => {
  assert.equal(dataCurta("2026-01-05"), "05/01/2026");
});

test("normaliza, gera slug e escapa HTML", () => {
  assert.equal(normalizar("Ação"), "acao");
  assert.equal(slugify("Aula 01: Guia inicial!"), "aula-01-guia-inicial");
  assert.equal(escapar('<a href="x">'), "&lt;a href=&quot;x&quot;&gt;");
});
