# Como publicar uma live nova

Todo o conteúdo fica em `public/content/`: `lives.json` (as lives) e `cortes.json` (os cortes). O layout lê esses arquivos sozinho. Depois de editar, rode `npm run validate`: ele aponta campo faltando, tempo mal escrito, arquivo inexistente e corte que não existe.

## 1. Os cortes

1. Gere cada corte em 720p (de preferência até ~2 min) e a miniatura:
   ```bash
   ffmpeg -ss 0:12:30 -to 0:13:45 -i live.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -c:a aac -b:a 96k -movflags +faststart public/media/cortes/12-meu-corte.mp4
   ffmpeg -ss 0:12:40 -i live.mp4 -frames:v 1 -vf scale=1280:-2 public/media/cortes/12-meu-corte.jpg
   ```
   O `video` também aceita link do YouTube ou do Google Drive, em vez de um arquivo.
2. Adicione em `public/content/cortes.json`:
   ```json
   {
     "id": "corte-aula02-01",
     "titulo": "Título que dá vontade de clicar",
     "slug": "titulo-que-da-vontade-de-clicar",
     "categoria": "Roteiro",
     "data": "2026-10-22",
     "duracao": "1:15",
     "descricao": "Uma frase sobre o trecho.",
     "miniatura": "media/cortes/12-meu-corte.jpg",
     "video": "media/cortes/12-meu-corte.mp4",
     "fonte": "#/lives/aula-02?t=750",
     "rotuloFonte": "Ver no guia da live (12:30)",
     "tags": ["roteiro"]
   }
   ```
   `fonte` com `?t=SEGUNDOS` abre o guia da live com o capítulo destacado.

## 2. A live

Adicione em `public/content/lives.json`:

```json
{
  "id": "live-aula-02",
  "titulo": "Aula 02: …",
  "slug": "aula-02",
  "categoria": "Aula ao vivo",
  "data": "2026-10-22",
  "duracao": "2:05:00",
  "descricao": "Uma ou duas frases.",
  "miniatura": "media/capas/aula-02.jpg",
  "linkLive": "https://link-da-gravacao",
  "video": "",
  "tarefas": [
    { "t": "1:58:00", "texto": "Só se pediram algo realmente importante." }
  ],
  "capitulos": [
    { "t": "0:00:00", "titulo": "Abertura", "resumo": "…" },
    { "t": "0:12:30", "titulo": "Momento X", "resumo": "…", "destaque": true }
  ],
  "cortes": ["corte-aula02-01"]
}
```

- **`tarefas`**: só entra o que os apresentadores **pedirem e for muito importante**. Sem tarefa, deixe `[]` e a caixa não aparece.
- **`capitulos`** monta o guia de navegação. `destaque: true` coloca o selo “imperdível”.
- **`cortes`** lista os `id` dos cortes na ordem em que aparecem.
- Se a gravação estiver no **YouTube**, coloque o link em `video`: o player aparece na página e cada tempo pula direto para o momento. Se estiver numa plataforma fechada (Hotmart), use só `linkLive`. Nesse caso, clicar num tempo abre a plataforma e copia o tempo.
