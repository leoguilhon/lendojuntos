# Semana 5 — wireframes acessíveis de baixa fidelidade

## Identificação

| Item | Definição |
| --- | --- |
| Período planejado | 21/09/2026 a 27/09/2026 |
| Data de consolidação | 28/09/2026, fuso America/Sao_Paulo |
| Produto | LendoJuntos web responsivo |
| Escopo | T01–T09, C01–C10 e F01–F06 do inventário da Semana 2 |
| Entradas | [backlog priorizado](semana-03-backlog-priorizado-acessibilidade.md), [plano técnico](semana-04-plano-tecnico-acessibilidade.md) e [metodologia de testes](semana-04-metodologia-testes-acessibilidade.md) |
| Entregas | estes wireframes e os [fluxos anotados](semana-05-fluxos-anotados.md) |

## Objetivo e limites

Os wireframes definem a estrutura, a hierarquia, a ordem de leitura e o comportamento de foco antes do protótipo visual e da implementação. Eles cobrem landmarks, link de salto, títulos, formulários, cartões, menus, diálogos e feedback dinâmico sem escolher ainda cores, tipografia final, espaçamentos ou acabamento de componentes.

Esta entrega é uma especificação de desenho. Ela não altera o frontend, não encerra os achados da auditoria e não declara conformidade. Contraste, foco visível, zoom/reflow e estados visuais serão detalhados no protótipo da Semana 6 e verificados após a implementação.

## Legenda

| Notação | Significado |
| --- | --- |
| `H1`, `H2`, `H3` | nível de título; não representa tamanho visual |
| `(n)` | ordem de tabulação prevista; elementos estáticos não recebem número |
| `(R)` | destino de foco programático após mudança de rota, fora da ordem normal de tabulação |
| `[link → destino]` | link nativo com endereço real |
| `[botão: ação]` | botão nativo; não navega para outra página |
| `[estado: mensagem]` | região de status ou alerta anunciada sem busca visual |
| `{...}` | conteúdo variável ou repetido |
| `↓` | continuação na ordem do DOM e da leitura |

Os números recomeçam em cada wireframe. A sequência indica a ordem relativa, não um pedido para usar `tabindex` positivo. O DOM deve seguir a ordem visual.

## Decisões transversais

1. Cada rota possui um `main` único, um `h1` descritivo e um título de documento no formato “Tela — LendoJuntos”. Após navegação SPA, o foco programático vai para o `h1` identificado com `(R)` sem colocá-lo permanentemente na ordem de tabulação.
2. Nas rotas autenticadas, “Ir para o conteúdo principal” é o primeiro controle focável. Ele fica visível ao receber foco e leva a leitura e o foco ao `main` sem mudar a rota.
3. Cabeçalho, navegação, conteúdo principal, formulários e regiões auxiliares seguem semântica HTML nativa. ARIA só complementa nomes, estados e relações que o HTML não fornece.
4. A hierarquia de títulos não salta níveis. Cartões repetidos usam `article` quando têm conteúdo independente; agrupamentos de cartões são listas quando a quantidade e a relação entre itens importam.
5. Um cartão de navegação contém um link nativo no título ou uma ação “Ver detalhes”. Favoritar, curtir, ingressar e confirmar presença são botões irmãos, nunca controles aninhados no link.
6. Estado não depende apenas de cor ou ícone. Texto e estado programático distinguem favorito, curtido, situação da leitura, presença, item atual e erro.
7. Todo campo mantém rótulo visível. Instrução e erro têm identificadores próprios; campo inválido referencia ambos e expõe `aria-invalid`. Erro conhecido informa problema e correção.
8. Sucesso e atualização não urgente usam região de status. Erro que exige ação usa alerta único. Carregamento relevante expõe condição ocupada e um nome compreensível.
9. Diálogo recebe nome pelo título, move o foco para um alvo definido, contém `Tab` e `Shift+Tab`, fecha por `Escape`, Fechar e Cancelar e devolve o foco ao acionador.
10. Em largura estreita e zoom, colunas viram uma sequência única. Nenhum controle ou texto essencial depende de rolagem horizontal.

## W01 — autenticação: login e cadastro

Cobertura: T01, T02, C06–C09, F01 e A11Y-002, A11Y-003, A11Y-007, A11Y-009 e A11Y-011.

```text
+------------------------------------------------------------------+
| [main: autenticação]                                             |
|                                                                  |
| Marca LendoJuntos                                                |
| H1 (R) Organize clubes e leituras em conjunto                    |
| Texto curto sobre a finalidade da plataforma                     |
| Lista estática de benefícios                                     |
|                                                                  |
| H2 Entrar                                                        |
| [estado: erro geral ou confirmação, quando existir]              |
|                                                                  |
| E-mail                                                           |
| (1) [____________________] autocomplete=email                    |
|     [erro do e-mail: problema + sugestão]                        |
| Senha                                                            |
| (2) [____________________] autocomplete=current-password         |
|     [erro da senha: problema + sugestão]                         |
| (3) [botão: Entrar / Entrando...]                                |
| (4) [link → /register: Criar conta]                              |
+------------------------------------------------------------------+
```

No cadastro, o bloco `H2 Entrar` é substituído por `H2 Criar conta`; a ordem passa a ser Nome (`autocomplete=name`), E-mail (`email`), Senha (`new-password`), Criar conta e Voltar para login. A instrução de senha fica ligada ao campo antes de qualquer erro.

Com erro de envio, o resumo recebe foco somente quando necessário para localizar múltiplos erros; em seguida, oferece links para os campos. Com erro de um único campo, o foco vai ao primeiro campo inválido. Os valores válidos permanecem preenchidos.

### Variante estreita

```text
+------------------------------+
| [main]                       |
| Marca                        |
| H1 (R) Propósito             |
| Benefícios em lista          |
| H2 Entrar/Criar conta        |
| [estado]                     |
| Rótulo                       |
| (1) [campo................]  |
| ajuda/erro com quebra        |
| ...                          |
| (n) [botão largura útil...]  |
| (n+1) [link...............]  |
+------------------------------+
```

A ordem do conteúdo permanece igual; elementos decorativos não criam uma segunda coluna nem largura mínima que provoque overflow.

## W02 — estrutura autenticada compartilhada

Cobertura: T03–T09, C01, C07–C09, todos os fluxos autenticados e A11Y-002, A11Y-004, A11Y-005 e A11Y-008.

```text
+------------------------------------------------------------------+
| (1) [link: Ir para o conteúdo principal]                         |
| [header]                                                         |
|   (2) [link → /dashboard: LendoJuntos]                           |
|   [nav: Navegação principal]                                     |
|     (3) [link → /dashboard: Clubes] [atual quando aplicável]     |
|     (4) [link → /profile: Perfil] [atual quando aplicável]       |
|   Leitor atual: {nome}                                           |
|   (5) [botão: Sair]                                              |
+------------------------------------------------------------------+
| [main id=conteudo-principal]                                     |
|   H1 (R) {título da rota}                                        |
|   {conteúdo específico de W03–W07}                               |
+------------------------------------------------------------------+
```

Ao ativar o link de salto, o foco chega ao início do `main`. Após navegar por um link, o novo `h1` recebe foco programático. Ao voltar pelo navegador, a regra de restauração de contexto será validada na implementação sem criar foco no `body`.

Em largura estreita, marca, navegação, identificação e saída quebram em linhas previsíveis; o conteúdo permanece depois do cabeçalho no DOM. A navegação não se transforma em controle oculto sem um nome e um estado expostos.

## W03 — dashboard de clubes

Cobertura: T03, C02, C03, C05, C07–C09, F02, F06 e A11Y-001, A11Y-003, A11Y-006, A11Y-008 e A11Y-010.

```text
[estrutura W02]
[main]
  H1 (R) Clubes do livro                         (6) [botão: Criar clube]
  Texto introdutório
  Métricas estáticas: {meus clubes} | {favoritos} | {disponíveis}
  [estado: clube criado / ingresso / favorito alterado / erro]

  H2 Meus clubes
  Lista
    article
      H3 (7) [link → /clubs/{id}: {nome do clube}]
      {descrição e quantidade de membros}
      (8) [botão alternável: Favoritar {clube}; estado: não pressionado]
    article {próximo clube}

  H2 Clubes disponíveis
  Lista
    article
      H3 (n)   [link → /clubs/{id}: {nome do clube}]
      (n+1)    [botão alternável: Favoritar {clube}; estado]
      (n+2)    [botão: Ingressar em {clube}]

  Estado vazio: mensagem + próximo passo [botão: Criar clube]
```

O nome do link diferencia clubes homônimos quando houver contexto suficiente. Atualizações de favorito e ingresso são anunciadas uma vez e não movem o foco. O diálogo “Criar clube” segue W08.

## W04 — detalhes do clube

Cobertura: T04, C02–C05, C07–C10, F02–F04, F06 e A11Y-001, A11Y-006, A11Y-010, A11Y-012 e A11Y-013.

```text
[estrutura W02]
[main]
  H1 (R) {nome do clube}
  (6) [botão alternável: Favoritar {clube}; estado]
  (7) [link → /dashboard: Voltar aos clubes]
  (8) [botão: Sair do clube]                    membro não administrador
  (8) [botão: Ações do clube; expandido=false] administrador → W09
  {descrição, quantidade de membros e papel da pessoa}
  [estado: atualização, saída, erro]

  H2 Livro atual
    H3 (9) [link → /books/{id}: {título}]
    {autor e situação textual}
    Estado vazio: Nenhum livro em leitura + [link → livros do clube]

  H2 Próximo encontro
    H3 (10) [link → /clubs/{id}/meetings/{meetingId}: {título}]
    {data, hora, local e livro relacionado}
    Estado vazio: Nenhum encontro agendado + [link → encontros]

  H2 Membros
    Lista com região rolável somente se necessária; foco nunca fica oculto

  H2 Livros do clube
    (11) [link → /clubs/{id}/books: Ver todos os livros]
    Lista-resumo estática com títulos e estados

  H2 Encontros
    (12) [link → /clubs/{id}/meetings: Ver todos os encontros]
    Lista-resumo estática com data e estado
```

Painéis inteiros deixam de simular links: somente links explícitos entram na ordem de foco. Ações destrutivas abertas pelo menu seguem a confirmação de W08 e nomeiam objeto e consequência.

## W05 — livros do clube e detalhes da leitura

Cobertura: T05, T06, C02, C03, C05–C09, F03, F05, F06 e A11Y-001, A11Y-003, A11Y-006, A11Y-009, A11Y-010 e A11Y-014.

### Lista de livros — T05

```text
[estrutura W02]
[main]
  H1 (R) Livros do {clube}
  (6) [botão: Cadastrar livro]                  somente administrador
  (7) [link → /clubs/{id}: Voltar ao clube]
  [estado: livro cadastrado / curtida alterada / erro]

  H2 Todos os livros
  Lista
    article
      {situação em texto: Planejado | Em leitura | Concluído}
      H3 (8) [link → /books/{id}: {título}]
      {autor e sinopse resumida}
      (9) [botão alternável: Curtir {livro}; estado]
    article {próximo livro}

  Estado vazio: Nenhum livro cadastrado + próximo passo permitido
```

### Detalhes do livro — T06

```text
[estrutura W02]
[main]
  H1 (R) {título do livro}
  (6) [botão alternável: Curtir {livro}; estado]
  (7) [link → /clubs/{clubId}: Voltar ao clube]
  [estado: situação / curtida / comentário / erro]

  H2 Detalhes da leitura
    {autor, sinopse e situação atual em texto}
    Grupo “Situação da leitura”
      (8) [opção: Planejado] (9) [opção: Em leitura] (10) [opção: Concluído]

  H2 Encontros relacionados
    (11) [link → encontros do clube: Ver todos]
    Lista de H3 [link → encontro] com data, hora e estado

  H2 Comentários do livro — {quantidade}
    Lista de artigos: {autor}, {data/hora}, {conteúdo}
    Estado vazio: Nenhum comentário publicado
    Novo comentário
    (n)   [textarea........................................]
          [erro ligado ao campo]
    (n+1) [botão: Revisar comentário]
```

Antes de persistir um comentário, a etapa de revisão mostra o texto e oferece “Voltar e editar” e “Publicar comentário”. Se a implementação optar por desfazer/excluir em vez de revisão, deve manter o mesmo nível de proteção e documentar a decisão em A11Y-014.

## W06 — encontros e detalhes do encontro

Cobertura: T07, T08, C02, C04–C09, F04–F06 e A11Y-001, A11Y-003, A11Y-006, A11Y-009, A11Y-010, A11Y-012 e A11Y-014.

### Lista de encontros — T07

```text
[estrutura W02]
[main]
  H1 (R) Encontros do {clube}
  (6) [botão: Criar encontro]                  somente administrador
  (7) [link → /clubs/{id}: Voltar ao clube]
  [estado: encontro criado / erro]

  H2 Próximos encontros
  Lista
    article
      Estado textual: Próximo
      H3 (8) [link → /clubs/{id}/meetings/{meetingId}: {título}]
      {data, hora, local, livro e quantidades}

  H2 Histórico de encontros
  Lista com a mesma composição e estado textual “Realizado”

  Estados vazios separados para próximos encontros e histórico
```

### Detalhes do encontro — T08

```text
[estrutura W02]
[main]
  H1 (R) {título do encontro}
  (6) [link → lista de encontros: Voltar aos encontros]
  (7) [botão: Ações do encontro; expandido=false] administrador → W09
  [estado: presença / comentário / edição / erro]

  H2 Informações do encontro
    Estado textual: Próximo | Realizado
    {data, hora, local, livro relacionado, quantidades}
    H3 Pauta
    {pauta ou mensagem de ausência}

  H2 Presenças confirmadas — {quantidade}
    (8) [botão alternável: Confirmar presença; estado: não pressionado]
         ou “Cancelar presença”; estado: pressionado
    Lista de participantes; “Você” também em texto

  H2 Comentários e registro — {quantidade}
    Lista de artigos: {autor}, {data/hora}, {conteúdo}
    Novo comentário
    (n)   [textarea........................................]
          [erro ligado ao campo]
    (n+1) [botão: Revisar comentário]
```

Confirmar presença atualiza nome, estado programático, lista e contagem sem depender de cor. Comentários seguem a mesma proteção definida em W05.

## W07 — perfil

Cobertura: T09, C06, C07, F01 e A11Y-002, A11Y-003, A11Y-009, A11Y-011 e A11Y-014.

```text
[estrutura W02]
[main]
  H1 (R) Perfil
  E-mail da conta: {e-mail}                     somente leitura
  [estado: perfil salvo / erro de envio]

  [form: Editar perfil]
    Nome
    (6) [____________________] autocomplete=name
        [erro do nome]
    Biografia
    (7) [textarea...............................]
        Ajuda: conteúdo público e limite, quando aplicável
    (8) [botão: Revisar alterações]
```

A revisão apresenta os campos alterados antes de salvar ou, se a API e a experiência permitirem, a implementação oferece desfazer com anúncio acessível. O e-mail não se parece com campo editável.

## W08 — diálogo modal compartilhado

Cobertura: os oito diálogos de C05, F06 e A11Y-001, A11Y-009, A11Y-013 e A11Y-014.

```text
Conteúdo de fundo: inerte enquanto o diálogo estiver aberto

                +------------------------------------------+
                | [dialog modal, nomeado por dialog-title] |
                | H2 id=dialog-title {ação + objeto}       |
                |                         (1) [botão: Fechar]|
                |                                          |
                | Texto/instrução ou formulário            |
                | (2) [primeiro campo ou ação segura]      |
                |     [ajuda/erro associado]               |
                | ...                                      |
                | (n-1) [botão: Cancelar]                  |
                | (n)   [botão: Salvar/Confirmar]          |
                +------------------------------------------+

Tab no último → primeiro | Shift+Tab no primeiro → último
Escape/Fechar/Cancelar → fecha sem ação e retorna ao acionador
Clique concluído no fundo → fecha; pressionar o ponteiro não fecha sozinho
```

| Variação | Foco inicial | Conteúdo obrigatório | Ação principal |
| --- | --- | --- | --- |
| Criar clube | Nome | nome e descrição; erros junto aos campos | Criar clube |
| Editar clube | Nome preenchido | alterações preservadas ao corrigir erro | Salvar alterações |
| Excluir clube | Cancelar | nome do clube e consequências | Excluir clube |
| Sair do clube | Cancelar | nome do clube e efeito da saída | Sair do clube |
| Cadastrar livro | Título | título, autor, sinopse e situação | Cadastrar livro |
| Criar encontro | Título | título, data/hora, local, livro e pauta | Criar encontro |
| Editar encontro | Título preenchido | dados atuais e erros associados | Salvar alterações |
| Excluir encontro | Cancelar | título e dados relacionados que serão excluídos | Apagar encontro |

Em confirmação destrutiva, Cancelar recebe o foco inicial. Em formulário, o primeiro campo recebe foco. Nenhuma variante fecha por sucesso antes de anunciar ou estabelecer o novo contexto.

## W09 — menu de ações compartilhado

Cobertura: os dois menus de C04, F06 e A11Y-012.

```text
(n) [botão: Ações do {clube|encontro}; expandido=false]
                  |
                  | Enter/Espaço/ponteiro
                  v
    +---------------------------------------+
    | estado do acionador: expandido=true  |
    | (n+1) [botão: Editar {objeto}]       |
    | (n+2) [botão: Excluir {objeto}]      |
    +---------------------------------------+

Escape → fecha e mantém/devolve foco ao acionador
Clique externo concluído → fecha sem ativar outra ação
Fechado → opções ausentes da ordem de foco e da árvore acessível
```

O nome textual contextual substitui o acionador composto somente por emoji. Abrir uma opção fecha o menu e transfere o foco conforme W08.

## Comportamentos de carregamento, erro e vazio

Os padrões abaixo detalham feedback dinâmico (C07), carregamento (C08) e estado vazio (C09) para que as variações não sejam tratadas como telas sem estrutura.

| Estado | Estrutura prevista | Foco |
| --- | --- | --- |
| Carregando rota | `main` nomeado, condição ocupada e texto “Carregando {objeto}” | permanece em contexto previsível; não alterna repetidamente |
| Erro de carregamento | título da rota ou “Não foi possível carregar”, mensagem compreensível e ação Tentar novamente/Voltar | erro anunciado uma vez; ação entra na ordem normal |
| Lista vazia | título da seção, explicação e próximo passo permitido | não muda automaticamente |
| Sucesso local | região de status persistente o bastante para leitura | permanece no acionador ou vai ao novo contexto quando a tarefa exigir |
| Erro de formulário | resumo opcional e mensagens associadas aos campos | primeiro erro ou resumo, conforme quantidade e contexto |

## Matriz de cobertura dos wireframes

| Superfície | Wireframe | Componentes | Fluxos |
| --- | --- | --- | --- |
| T01 Login | W01 | C06–C09 | F01 |
| T02 Cadastro | W01 | C06–C09 | F01 |
| T03 Dashboard | W02, W03, W08 | C01–C03, C05, C07–C09 | F01, F02, F06 |
| T04 Clube | W02, W04, W08, W09 | C01–C10 | F02–F04, F06 |
| T05 Livros | W02, W05, W08 | C01–C03, C05–C09 | F03, F06 |
| T06 Livro | W02, W05 | C01–C03, C06–C09 | F03, F05 |
| T07 Encontros | W02, W06, W08 | C01, C02, C05–C09 | F04, F06 |
| T08 Encontro | W02, W06, W08, W09 | C01–C09 | F04–F06 |
| T09 Perfil | W02, W07 | C01, C06–C09 | F01 |

## Rastreabilidade com o backlog

| Achado | Decisão incorporada |
| --- | --- |
| A11Y-001 | W08 define nome, modalidade, foco inicial, contenção, fechamento e retorno |
| A11Y-002 | W01–W07 definem título, `h1` e destino `(R)` por rota |
| A11Y-003 | todas as telas reservam regiões de status/alerta e mensagens por ação |
| A11Y-004 | todos os controles são enumerados para receber foco visível; detalhe visual fica para a Semana 6 |
| A11Y-005 | W02 torna o link de salto o primeiro controle das rotas autenticadas |
| A11Y-006 | W03–W06 separam links nativos e botões irmãos nos cartões |
| A11Y-007 | W01 inclui variante estreita em coluna única |
| A11Y-008 | estados não dependem de cor; tokens e medições ficam para a Semana 6 |
| A11Y-009 | W01, W05–W08 ligam instrução, erro e campo |
| A11Y-010 | W03–W06 nomeiam alternâncias e expõem estado textual/programático |
| A11Y-011 | W01 e W07 especificam finalidades de nome, e-mail e senhas |
| A11Y-012 | W09 define nome contextual, estado expandido, `Escape` e foco |
| A11Y-013 | W08 fecha somente no clique concluído no próprio fundo |
| A11Y-014 | W05–W08 preveem revisão, confirmação ou alternativa de reversão |

## Critério de conclusão da Semana 5

A entrega é considerada concluída porque:

- representa T01–T09 e os padrões compartilhados C01–C10;
- especifica landmarks, link de salto, hierarquia de títulos e ordem de foco;
- separa navegação e ações em cartões;
- define formulários, erros, estados, menus e os oito diálogos;
- inclui comportamento estreito/reflow sem decisões visuais de alta fidelidade;
- mantém rastreabilidade com F01–F06 e A11Y-001–014;
- é acompanhada por fluxos anotados que descrevem mudanças de rota, foco e feedback.
