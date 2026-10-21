# Próximos passos (sem custo agora, prontos para crescer)

O portal foi organizado para crescer sem reescrever o layout: **toda tela lê os mesmos JSON/Markdown** (`src/lib/data.js`). Trocar a origem dos dados (Drive, planilha, banco) muda só esse arquivo.

## Integração com Google Drive
- **Já funciona**: o campo `video` aceita links do Drive (`drive.google.com/file/d/…`). O player usa o visualizador do próprio Drive.
- **Depois**: uma pasta do Drive por tipo de conteúdo + um GitHub Action agendado que lista a pasta (API do Drive com conta de serviço, guardada em *Secrets* do GitHub, nunca no código) e atualiza `cortes.json`/`comunidade.json`.

## Automação dos resumos
O resumo da Aula 01 foi feito assim: transcrição local com Whisper → leitura → guia de capítulos com tempos → cortes com ffmpeg. Para automatizar:
1. Um script local (ou Action) recebe o vídeo/áudio da live, transcreve e gera um rascunho de `lives/NOME.md` + `capitulos`.
2. O rascunho entra como **Pull Request**: alguém revisa e aprova antes de publicar.
3. O mesmo vale para o WhatsApp: exportação do grupo → rascunho de `whatsapp.json` **já sem telefones** (o validador barra qualquer número que escapar).

## Sugestões da comunidade
- Agora: um segundo Google Forms (“sugira um corte/tema”) linkado no rodapé, sem backend.
- Depois: GitHub Issues com um modelo de sugestão, ou Giscus (comentários via GitHub Discussions, grátis).

## Moderação de vídeos
Fluxo atual (grátis): Google Forms → planilha → a moderação revisa → adiciona em `comunidade.json` com `"publicado": true`.
Para pausar algo sem apagar: `"publicado": false`.

## Área administrativa e banco de dados (se um dia precisar)
- **Decap CMS** (grátis): painel web que edita os JSON/Markdown do repositório com login do GitHub. Não precisa de servidor.
- **Supabase/Firebase** (camada grátis): só se surgir necessidade real de upload direto, login de membros ou curtidas. Nesse caso, `src/lib/data.js` passa a ler da API, e as páginas não mudam.

## Ideias rápidas
- Gerar as miniaturas dos cortes com título por cima (template do Canva ou ffmpeg).
- Subir a live completa no YouTube (não listado): o guia de navegação passa a pular direto para o tempo, dentro do próprio portal.
- RSS/JSON Feed das novidades para avisos automáticos no grupo.
