# Checklist de testes

Rode `npm run check` antes (valida o conteúdo, roda os testes e gera o build). Depois confira manualmente:

## Computador (Chrome, Edge, Firefox ou Safari)

- [ ] Início: o destaque mostra o resumo de live mais recente. Cortes, lives, WhatsApp e comunidade aparecem com contagem.
- [ ] Menu: cada item abre a página certa e fica marcado. Voltar/avançar do navegador funciona.
- [ ] Busca do topo: `/` foca a busca. Buscar “contrato” traz cortes, a live e o WhatsApp. Um termo sem resultado mostra o estado vazio.
- [ ] Cortes: os filtros por categoria, data, ordem e tag funcionam, combinados com a busca. “Limpar filtros” volta tudo.
- [ ] Player: play/pause e barra de progresso. ±10 s nos botões, **velocidade 0,5x a 2x** no menu, `<` e `>` mudam a velocidade, `espaço`, `←` `→`, `f` (tela cheia), `m` (mudo). A velocidade escolhida é lembrada no próximo vídeo.
- [ ] Corte › “Ver no guia da live”: abre o resumo com o capítulo destacado.
- [ ] Resumo da live: o sumário lateral acompanha a rolagem. Clicar num tempo abre a live (Hotmart) e mostra o aviso com o tempo copiado. Os cortes aparecem no fim da página.
- [ ] Resumo do WhatsApp: o tópico abre pelo sumário. “Ir para a mensagem” copia o trecho e abre o grupo. No WhatsApp do PC, Ctrl+F e Ctrl+V encontram a mensagem.
- [ ] Enviar vídeo: o botão abre o Google Forms (ou mostra o aviso se ainda não houver formulário configurado).
- [ ] Endereço inexistente (`#/qualquer-coisa`): mostra a página “não encontrada”.
- [ ] Teclado: `Tab` percorre links e botões com contorno visível. “Pular para o conteúdo” aparece no primeiro `Tab`.

## Celular (Android e iPhone, em pé e deitado)

- [ ] Sem rolagem lateral em nenhuma página.
- [ ] O menu ☰ abre e fecha e fecha sozinho ao escolher uma página. “Buscar no portal” fica dentro do menu.
- [ ] Os cards ficam em uma coluna e as miniaturas carregam conforme a rolagem.
- [ ] Player: o toque dá play/pause. Os botões ficam fáceis de tocar. O menu de velocidade abre. A tela cheia funciona (no iPhone, a do sistema).
- [ ] Resumo da live: o “Nesta página” começa fechado e abre ao tocar. Os tempos são tocáveis.
- [ ] WhatsApp: “Ir para a mensagem” abre o app do WhatsApp.
- [ ] Texto legível sem zoom. Os botões têm no mínimo ~40 px de altura.

## Depois de publicar no GitHub Pages

- [ ] A aba **Actions** fica verde (validate, test, build e deploy).
- [ ] O site abre em `https://USUARIO.github.io/REPOSITORIO/`, com CSS, fontes, miniaturas e vídeos.
- [ ] Atualizar a página (F5) dentro de uma rota (ex.: `#/cortes`) continua funcionando.
- [ ] Compartilhar um link de corte no WhatsApp abre direto naquele corte.
