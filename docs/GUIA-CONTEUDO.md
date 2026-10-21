# Guia de conteúdo: como publicar sem mexer no código

Todo o conteúdo do portal fica em **`public/content/`**. O layout lê esses arquivos sozinho e monta as listagens, as páginas, a busca e os filtros. Para publicar, você só edita JSON e Markdown.

```
public/
├─ content/
│  ├─ config.json        ← nome do portal, link do formulário, grupos do WhatsApp
│  ├─ cortes.json        ← cortes das lives
│  ├─ lives.json         ← resumos das lives (lista)
│  ├─ lives/*.md         ← texto longo de cada resumo de live
│  ├─ whatsapp.json      ← resumos do grupo
│  └─ comunidade.json    ← vídeos enviados pelos membros
├─ media/
│  ├─ cortes/            ← arquivos .mp4 curtos e miniaturas .jpg dos cortes
│  └─ capas/             ← capas das lives e dos resumos
└─ img/demo/             ← capas dos exemplos fictícios
```

Depois de editar, rode `npm run validate`. Ele aponta campo faltando, data errada, arquivo que não existe, slug repetido e até número de telefone esquecido num resumo do WhatsApp.

---

## Campos comuns a toda publicação

| Campo | Obrigatório | Exemplo | Para que serve |
|---|---|---|---|
| `id` | sim | `"corte-aula01-03"` | Identificador único (usado em `relacionados`) |
| `titulo` | sim | `"Por que o vídeo-presente abre portas"` | Título do card e da página |
| `slug` | sim | `"video-presente-abre-portas"` | Endereço: `#/cortes/video-presente-abre-portas`. Só minúsculas sem acento, números e hífen |
| `categoria` | sim | `"Abordagem"` | Vira opção no filtro de categoria |
| `data` | sim | `"2026-10-19"` | Sempre AAAA-MM-DD |
| `descricao` | sim | `"Em 1 minuto…"` | Texto curto do card |
| `miniatura` | não | `"media/cortes/03.jpg"` ou URL | Imagem 16:9 |
| `tags` | não | `["roteiro", "gancho"]` | Filtro por tag e busca |
| `relacionados` | não | `["live-aula-01"]` | Lista de `id` mostrada no fim da página |
| `demo` | não | `true` | Mostra o selo “Demonstração” |
| `publicado` | não | `false` | Esconde do site sem apagar |

---

## 1. Adicionar um corte

1. Gere o corte curto (até ~2 min) em **720p**, de preferência com menos de 15 MB. Exemplo com ffmpeg:
   ```bash
   ffmpeg -ss 00:12:30 -to 00:13:45 -i live.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart public/media/cortes/meu-corte.mp4
   ffmpeg -ss 00:12:40 -i live.mp4 -frames:v 1 -vf scale=1280:-2 public/media/cortes/meu-corte.jpg
   ```
   Prefere não guardar vídeo no repositório? Suba no **YouTube** (pode ser “não listado”) ou no **Google Drive** (“qualquer pessoa com o link”) e use o link no campo `video`.
2. Adicione um item em `public/content/cortes.json`:
   ```json
   {
     "id": "corte-aula01-07",
     "titulo": "Título que dá vontade de clicar",
     "slug": "titulo-que-da-vontade-de-clicar",
     "categoria": "Roteiro",
     "data": "2026-10-19",
     "duracao": "1:15",
     "descricao": "Uma frase sobre o que a pessoa vai aprender.",
     "miniatura": "media/cortes/meu-corte.jpg",
     "video": "media/cortes/meu-corte.mp4",
     "fonte": "#/lives/aula-01-guia-inicial?t=750",
     "rotuloFonte": "Ver este trecho no guia da live",
     "tags": ["roteiro"],
     "relacionados": ["live-aula-01"]
   }
   ```
   - `video` aceita: arquivo do site (`media/...mp4`), link do **YouTube**, link do **Google Drive** ou link de outra plataforma (vira botão “Assistir na plataforma”).
   - Com arquivo `.mp4` ou YouTube, o player tem **controle de velocidade** (0,5x a 2x). No Drive, a velocidade fica no menu ⚙ do próprio Drive.
   - `fonte` com `?t=SEGUNDOS` abre o resumo da live com o capítulo destacado.

## 2. Adicionar um resumo de live

1. Crie o texto em `public/content/lives/NOME.md`. Use `##` para as seções (elas viram o sumário lateral) e escreva tempos entre colchetes, como `[1:02:30]`. Eles viram botões clicáveis.
   ```markdown
   ## Principais acontecimentos
   - [0:12:30] A equipe explicou…

   ## Momentos marcantes
   > “Frase marcante.” [1:05:10]
   ```
2. Adicione em `public/content/lives.json`:
   ```json
   {
     "id": "live-aula-02",
     "titulo": "Aula 02 — …",
     "slug": "aula-02-…",
     "categoria": "Aula ao vivo",
     "data": "2026-10-22",
     "duracao": "2:05:00",
     "descricao": "…",
     "miniatura": "media/capas/aula-02.jpg",
     "conteudo": "lives/aula-02.md",
     "linkLive": "https://link-da-gravacao",
     "video": "",
     "capitulos": [
       { "t": "0:00:00", "titulo": "Abertura", "resumo": "…" },
       { "t": "0:12:30", "titulo": "Momento X", "resumo": "…", "destaque": true }
     ],
     "tags": ["…"],
     "relacionados": ["corte-aula02-01"]
   }
   ```
   - `capitulos` monta o **Guia de navegação**. `destaque: true` coloca o selo “imperdível”.
   - Se a gravação estiver no **YouTube**, coloque o link em `video`: o player aparece na página e cada tempo clicado pula direto para o momento. Se estiver numa plataforma fechada (ex.: Hotmart), use só `linkLive`. Nesse caso, clicar num tempo abre a plataforma e copia o tempo para você.

## 3. Adicionar um resumo do WhatsApp

Em `public/content/whatsapp.json`:

```json
{
  "id": "zap-2026-10-22",
  "titulo": "…",
  "slug": "…",
  "categoria": "Resumo do grupo",
  "data": "2026-10-22",
  "periodo": "21/10 e 22/10",
  "grupo": "principal",
  "descricao": "…",
  "miniatura": "media/capas/zap-22.svg",
  "importante": ["Aviso que ninguém pode perder."],
  "topicos": [
    {
      "titulo": "Assunto",
      "resumo": "Texto em **Markdown**.",
      "mensagens": [
        { "quando": "2026-10-22 19:42", "trecho": "Trecho curto da mensagem", "busca": "pedaço exato do texto original" }
      ],
      "links": [{ "titulo": "Resumo da aula", "url": "#/lives/aula-02" }]
    }
  ]
}
```

**Regras de privacidade (o validador confere algumas):**
- Nunca coloque número de telefone, @ de perfil pessoal, endereço ou foto.
- `autor` só aparece se você também puser `"autorizado": true`, e só com autorização da pessoa.
- Use trechos curtos. Evite assuntos pessoais (saúde, família, finanças pessoais).

**Botão “Ir para a mensagem”:** o WhatsApp não tem link para uma mensagem específica. O botão copia o texto de `busca` e abre o grupo (link de convite definido em `config.json › grupos`). No WhatsApp do PC, aperte **Ctrl+F**, cole (**Ctrl+V**) e a mensagem aparece para responder. Por isso, o `busca` precisa ser um **pedaço exato** do texto original, com os mesmos erros de digitação.

## 4. Adicionar um vídeo da comunidade

1. Receba o link pelo formulário (configure `formularioEnvio` em `config.json` com o link do Google Forms).
2. Revise o vídeo (moderação) e adicione em `public/content/comunidade.json` com `video` = link do YouTube/Drive e `autor` = apelido autorizado.

## 5. Trocar uma miniatura

Coloque a imagem (16:9, JPG ou WebP, ~1280×720, idealmente < 200 KB) em `public/media/...` e aponte o campo `miniatura` para ela. Links externos (`https://…`) também funcionam.
