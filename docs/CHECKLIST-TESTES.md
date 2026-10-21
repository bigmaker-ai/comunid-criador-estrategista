# Checklist de testes

Rode `npm run check` antes (valida o conteúdo, roda os testes e gera o build). Depois confira manualmente:

## Computador (Chrome, Edge, Firefox ou Safari)

- [ ] Player: play/pause e barra de progresso. ±10 s nos botões, **velocidade 0,5x a 2x** no menu, `<` e `>` mudam a velocidade, `espaço`, `←` `→`, `f` (tela cheia), `m` (mudo). A velocidade escolhida é lembrada no próximo vídeo.
- [ ] Corte › “Ver no guia da live”: abre o resumo com o capítulo destacado.
- [ ] Página da live: tarefas no topo, depois cortes e guia de navegação. Clicar num tempo abre a live (Hotmart) e mostra o aviso com o tempo copiado. Os cortes aparecem no fim da página.
- [ ] Endereço inexistente (`#/qualquer-coisa`): mostra a página “não encontrada”.
- [ ] Teclado: `Tab` percorre links e botões com contorno visível. “Pular para o conteúdo” aparece no primeiro `Tab`.

## Celular (Android e iPhone, em pé e deitado)

- [ ] Sem rolagem lateral em nenhuma página.
- [ ] Os cards ficam em uma coluna e as miniaturas carregam conforme a rolagem.
- [ ] Player: o toque dá play/pause. Os botões ficam fáceis de tocar. O menu de velocidade abre. A tela cheia funciona (no iPhone, a do sistema).
- [ ] Página da live: os tempos do guia e das tarefas são tocáveis.
- [ ] Texto legível sem zoom. Os botões têm no mínimo ~40 px de altura.

## Depois de publicar no GitHub Pages

- [ ] A aba **Actions** fica verde (validate, test, build e deploy).
- [ ] O site abre em `https://USUARIO.github.io/REPOSITORIO/`, com CSS, fontes, miniaturas e vídeos.
- [ ] Atualizar a página (F5) dentro de uma rota (ex.: `#/cortes`) continua funcionando.
- [ ] Compartilhar um link de corte no WhatsApp abre direto naquele corte.
