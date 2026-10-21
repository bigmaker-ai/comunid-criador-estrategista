# Resumos das lives: Criadores do Futuro

Site estático com, para cada live:

- **Tarefas pedidas na live**. Só aparece quando os apresentadores pedem algo realmente importante.
- **Guia de navegação** com os tempos certinhos. Clicar num tempo abre a gravação.
- **Cortes desta live**, com player próprio (velocidade de 0,5x a 2x e atalhos de teclado).

Funciona 100% no **GitHub Pages**: sem servidor, sem banco de dados, sem chave de API e sem domínio próprio.

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run check      # valida o conteúdo + testes + build
```

## Publicar no GitHub Pages (grátis)

1. Com o [GitHub CLI](https://cli.github.com) logado, na pasta do projeto:
   ```bash
   gh repo create comunid-criadores-estrategistas --public --source . --remote origin --push
   ```
2. No GitHub: **Settings › Pages › Source: GitHub Actions**.
3. A cada `git push` na `main`, o workflow `.github/workflows/deploy.yml` valida, testa, gera o build e publica em `https://USUARIO.github.io/comunid-criadores-estrategistas/` (o progresso aparece na aba **Actions**).

O build usa `base: "./"` e rotas com `#`, então funciona com qualquer nome de repositório.

## Publicar uma live nova (sem mexer no código)

Veja o passo a passo em **[docs/GUIA-CONTEUDO.md](docs/GUIA-CONTEUDO.md)**. Resumo: os cortes vão em `public/media/cortes/` e em `public/content/cortes.json`; a live vai em `public/content/lives.json`. Depois é só rodar `npm run validate` e dar `git push`.

## Estrutura

```
src/main.js            rotas: #/ (lives), #/lives/slug, #/cortes/slug
src/pages/             home, live, video (corte)
src/components/        player, cards, ícones
src/lib/               dados, formatação, roteador
src/styles/main.css    identidade visual (tema escuro)
public/content/        lives.json + cortes.json  ← todo o conteúdo
public/media/          cortes .mp4 (720p), miniaturas e capas
scripts/validate.mjs   validador de conteúdo
docs/                  guia de conteúdo e checklist de testes
```
