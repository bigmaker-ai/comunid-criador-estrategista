import { defineConfig } from "vite";

// base relativo: o mesmo build funciona em https://usuario.github.io/qualquer-nome-de-repo/
// (o site usa rotas com # , então não precisa de 404.html nem de reescrita de URL).
export default defineConfig({
  base: "./",
  build: { outDir: "dist", assetsInlineLimit: 0 },
});
