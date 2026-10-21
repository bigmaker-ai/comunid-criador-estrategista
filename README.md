# Portal da Comunidade: Criadores do Futuro

Site estático para quem perdeu a live ou não acompanhou o grupo ficar por dentro de tudo:

- **Cortes** das lives, com player próprio (velocidade de 0,5x a 2x e atalhos de teclado).
- **Resumos das lives**, com **guia de navegação por tempo**, sumário lateral e cortes relacionados.
- **Resumos do WhatsApp** organizados por tópicos, com o botão **“Ir para a mensagem”**.
- **Vídeos da comunidade**, com página explicando como enviar (via Google Forms).
- **Busca global**, filtros por categoria, tag e data, e estados vazios.

Funciona 100% no **GitHub Pages**: sem servidor, sem banco de dados, sem chave de API e sem domínio próprio.

## Estrutura

```
portal-comunidade/
├─ index.html               casca do site (cabeçalho, rodapé)
├─ src/
│  ├─ main.js               rotas (#/cortes, #/lives/slug…)
│  ├─ lib/                  dados, busca/filtros, markdown, roteador, formatação
│  ├─ components/           player, cards, filtros, ícones
│  ├─ pages/                home, listagem, vídeo, live, whatsapp, busca, enviar, sobre
│  └─ styles/main.css       identidade visual (tema escuro)
├─ public/
│  ├─ content/              ← TODO o conteúdo (JSON + Markdown)
│  └─ media/                ← cortes .mp4 curtos, miniaturas e capas
├─ scripts/validate.mjs     validador de conteúdo
├─ tests/                   testes de busca, filtros e formatação
├─ docs/                    guia de conteúdo, checklist de testes, próximos passos
└─ .github/workflows/       deploy automático no GitHub Pages
```

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm run check      # valida o conteúdo + testes + build
```

## Publicar no GitHub Pages (grátis)

1. Crie um repositório no GitHub (por exemplo `portal-comunidade`). Para usar o Pages de graça, ele precisa ser **público**.
2. Envie o projeto:
   ```bash
   git init
   git add .
   git commit -m "Portal da comunidade"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/portal-comunidade.git
   git push -u origin main
   ```
3. No GitHub, abra **Settings › Pages** e, em **Source**, escolha **GitHub Actions**.
4. Pronto. A cada `git push` na `main`, o workflow `.github/workflows/deploy.yml` valida o conteúdo, roda os testes, gera o build e publica em `https://SEU-USUARIO.github.io/portal-comunidade/`. O progresso aparece na aba **Actions**.

O caminho de publicação já está resolvido: o build usa `base: "./"` e rotas com `#`, então funciona com qualquer nome de repositório e não precisa de `404.html`.

## Publicar conteúdo novo (sem mexer no layout)

Tudo fica em `public/content/`. O passo a passo completo, com exemplos de cada campo, está em **[docs/GUIA-CONTEUDO.md](docs/GUIA-CONTEUDO.md)**.

Resumo:

| Quero publicar… | Edite |
|---|---|
| Um corte | `public/content/cortes.json` (+ o `.mp4` e o `.jpg` em `public/media/cortes/`, ou um link do YouTube/Drive) |
| Um resumo de live | `public/content/lives.json` + um `.md` em `public/content/lives/` |
| Um resumo do WhatsApp | `public/content/whatsapp.json` |
| Um vídeo da comunidade | `public/content/comunidade.json` |
| Nome, formulário, grupo | `public/content/config.json` |

Depois: `npm run validate` → `git add . && git commit -m "novo conteúdo" && git push`. Também dá para editar os arquivos direto no site do GitHub (ícone de lápis): o deploy roda sozinho.

### Configurar antes de divulgar

Em `public/content/config.json`:

- `formularioEnvio`: link do Google Forms de envio de vídeos (enquanto estiver vazio, a página “Enviar” mostra um aviso).
- `grupos[].convite`: link de convite do grupo do WhatsApp (`https://chat.whatsapp.com/…`), usado pelo botão “Ir para a mensagem”.

## Sobre os vídeos

- **Cortes curtos** (até ~2 min, 720p, ~2 a 6 MB) podem ficar no repositório, em `public/media/cortes/`. Os 11 cortes atuais somam ~42 MB. O GitHub Pages aceita sites de até 1 GB.
- **Lives completas e vídeos grandes não vão para o repositório**. Use o link da plataforma (Hotmart), do **YouTube** (pode ser “não listado”, e o player continua com controle de velocidade e salto pelos tempos do guia) ou do **Google Drive**.

## Privacidade

- Resumos do WhatsApp **sem telefones, sem nomes e sem dados pessoais**. O validador bloqueia números de telefone.
- Autoria só aparece com `"autorizado": true`.
- Conteúdo marcado com `"demo": true` mostra o selo **Demonstração** (exemplos fictícios).

## Documentação

- [docs/GUIA-CONTEUDO.md](docs/GUIA-CONTEUDO.md): como adicionar publicação, miniatura, resumo e vídeo
- [docs/CHECKLIST-TESTES.md](docs/CHECKLIST-TESTES.md): o que conferir no celular e no computador
- [docs/PROXIMOS-PASSOS.md](docs/PROXIMOS-PASSOS.md): Drive, automação, sugestões, moderação e área administrativa
