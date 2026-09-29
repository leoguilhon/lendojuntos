# Semana 5 — fluxos acessíveis anotados

## Finalidade

Este documento transforma os [wireframes de baixa fidelidade](semana-05-wireframes-acessiveis.md) em sequências de interação para F01–F06. Cada fluxo registra rota, controle, foco, feedback e recuperação esperados. As anotações orientam o protótipo da Semana 6, a implementação das Semanas 7–11 e o reteste da Semana 13; ainda não são evidência de que o frontend atende aos critérios.

## Convenções

| Símbolo | Significado |
| --- | --- |
| `R:` | rota ou mudança de contexto |
| `F:` | posição ou movimento de foco |
| `A:` | anúncio esperado em status/alerta |
| `E:` | estado programático e textual esperado |
| `X:` | saída alternativa, cancelamento ou recuperação |
| `→` | próxima etapa executada pela pessoa |

Regras comuns:

- a navegação por rota atualiza o título do documento e posiciona o foco no `h1` da nova tela;
- ações assíncronas mantêm o foco no acionador, salvo quando o objeto deixa de existir ou uma nova rota é o resultado esperado;
- mensagens não são repetidas a cada renderização;
- Cancelar e `Escape` nunca executam a ação principal;
- erro preserva valores válidos e leva ao ponto em que a correção pode ser iniciada;
- todos os caminhos possuem nomes e estados compreensíveis sem depender de emoji, posição ou cor.

## F01 — criar conta, entrar e sair

Objetivo: concluir autenticação, compreender erros e manter contexto nas mudanças entre T01, T02 e T03.

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | `R: /` → página “Entrar — LendoJuntos” | `F:` `h1` de W01; leitura alcança propósito antes do formulário |
| 2 | Ativar “Criar conta” | `R: /register`; `F:` novo `h1`; nenhuma posição antiga permanece ativa |
| 3 | Percorrer Nome, E-mail e Senha | `E:` rótulos visíveis e `autocomplete` coerente; instrução da senha ligada ao campo |
| 4 | Enviar dados inválidos | `A:` erro único; `F:` resumo ou primeiro campo inválido; valores válidos preservados |
| 5 | Corrigir e criar a conta | `A:` conclusão uma vez; `R: /dashboard`; `F:` `h1` “Clubes do livro” |
| 6 | Se a conta já existe, usar “Voltar para login” | `R: /`; `F:` `h1`; preenchimento antigo não é exposto indevidamente |
| 7 | Informar credencial inválida e depois válida | `A:` erro compreensível e associado; botão expõe “Entrando...” enquanto ocupado |
| 8 | Ativar “Sair” no cabeçalho | sessão encerrada; `R: /`; `F:` `h1` de login; rota protegida não fica visível |

Recuperações:

- erro da API mantém Nome/E-mail e não mantém senha quando isso aumentar o risco;
- recarregar uma rota protegida durante carregamento usa `main` nomeado e condição ocupada;
- voltar pelo navegador não reabre conteúdo autenticado depois do logout.

Rastreabilidade: W01, W02 e W07; A11Y-002, A11Y-003, A11Y-007, A11Y-009 e A11Y-011.

## F02 — localizar, abrir e ingressar em clube

Objetivo: localizar as duas listas, distinguir link de ação e confirmar a mudança de associação.

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | `R: /dashboard` | `F:` `h1`; primeiro `Tab` depois do foco de rota alcança a próxima ação lógica |
| 2 | Recarregar e usar “Ir para o conteúdo principal” | `F:` início do `main`; cabeçalho é ignorado sem alterar a rota |
| 3 | Navegar até “Meus clubes” e “Clubes disponíveis” | títulos delimitam listas; cada cartão anuncia nome, metadados, link e botões separados |
| 4 | Ativar o link do nome de um clube | `R: /clubs/{id}`; `F:` `h1` com nome do clube |
| 5 | Voltar a `/dashboard` | contexto retorna à lista; implementação valida restauração previsível sem foco no `body` |
| 6 | Alternar “Favoritar {clube}” | `E:` `aria-pressed` ou equivalente muda; `A:` “{clube} adicionado/removido dos favoritos”; foco permanece |
| 7 | Ativar “Ingressar em {clube}” | botão fica ocupado sem duplicar envio; `A:` ingresso confirmado |
| 8 | Concluir na página do clube ou na lista atualizada | se houver rota, `F:` novo `h1`; se a lista for atualizada, foco permanece no botão e seu novo estado é claro |

Estados alternativos: lista vazia oferece “Criar clube”; erro de carregamento oferece Tentar novamente; clube já ingressado deixa de oferecer ação incompatível.

Rastreabilidade: W02–W04; A11Y-002–A11Y-006, A11Y-008 e A11Y-010.

## F03 — consultar leitura e histórico

Objetivo: abrir a leitura atual, consultar todos os livros e alterar um estado sem ambiguidade.

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Em T04, localizar `H2 Livro atual` | item é conteúdo com link explícito, não painel clicável simulado |
| 2 | Ativar o título do livro atual | `R: /books/{id}`; `F:` `h1` com título do livro |
| 3 | Voltar ao clube e ativar “Ver todos os livros” | `R: /clubs/{id}/books`; `F:` `h1` “Livros do {clube}” |
| 4 | Percorrer a lista | `E:` Planejado, Em leitura ou Concluído aparece em texto; link e Curtir são controles irmãos |
| 5 | Alternar “Curtir {livro}” | estado programático e nome continuam coerentes; `A:` alteração anunciada uma vez; foco permanece |
| 6 | Abrir os detalhes e chegar ao grupo “Situação da leitura” | grupo tem nome; opção atual é exposta; opções não permitidas informam indisponibilidade |
| 7 | Escolher nova situação | `E:` opção atual muda; `A:` “Situação de {livro} alterada para {estado}”; sem dependência de cor |
| 8 | Consultar encontros relacionados e voltar | links têm destino real e preservam contexto de clube/livro no nome ou arredores |

Estados alternativos: ausência de livro atual, lista vazia e ausência de encontros relacionados oferecem explicação e próximo passo permitido pelo papel da pessoa.

Rastreabilidade: W02, W04 e W05; A11Y-002–A11Y-006, A11Y-008 e A11Y-010.

## F04 — consultar encontro e confirmar presença

Objetivo: distinguir encontro futuro e histórico, compreender seus dados e alternar presença.

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Em T04, ativar o link do próximo encontro ou “Ver todos os encontros” | `R:` T08 ou T07; `F:` `h1` correspondente |
| 2 | Em T07, percorrer Próximos encontros e Histórico | cada seção tem `h2`; cada item possui estado textual, data, hora, local e link nativo |
| 3 | Abrir um encontro | `R: /clubs/{id}/meetings/{meetingId}`; `F:` `h1` com título |
| 4 | Ler Informações e Pauta | ordem de leitura apresenta estado, agenda e livro antes das ações dependentes |
| 5 | Ativar “Confirmar presença” | botão fica ocupado; `E:` passa a pressionado/“Cancelar presença”; lista e contagem mudam |
| 6 | Ouvir confirmação | `A:` “Presença confirmada em {encontro}”; foco permanece no botão |
| 7 | Ativar “Cancelar presença” | `E:` retorna ao estado inicial; `A:` remoção confirmada; ausência na lista não perde o foco |
| 8 | Ativar “Voltar aos encontros” | `R:` T07; `F:` `h1`; estado atualizado é refletido quando aplicável |

Estados alternativos: ninguém confirmado, local a definir, livro não relacionado e encontro realizado são comunicados por texto, não somente por aparência.

Rastreabilidade: W02, W04 e W06; A11Y-002–A11Y-006, A11Y-008 e A11Y-010.

## F05 — ler e publicar comentários

Objetivo: ler metadados em ordem coerente, corrigir entrada e proteger a persistência do comentário.

O mesmo fluxo é executado em T06 e T08.

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Localizar `H2 Comentários` e a quantidade | quantidade é texto associado ao título; estado vazio continua compreensível |
| 2 | Ler os artigos existentes | cada comentário expõe autor, data/hora e conteúdo nessa ordem |
| 3 | Enviar textarea vazio | navegador/app identifica o campo; `F:` textarea; erro explica que conteúdo é obrigatório |
| 4 | Digitar texto e ativar “Revisar comentário” | nenhuma persistência ocorre ainda; revisão recebe título e foco previsível |
| 5 | Conferir o texto | opções “Voltar e editar” e “Publicar comentário” têm resultados distintos |
| 6 | Voltar e editar | texto é preservado; `F:` textarea ou ponto editável equivalente |
| 7 | Publicar | botão fica ocupado e impede duplicidade; novo comentário entra uma vez na lista |
| 8 | Receber confirmação | `A:` “Comentário publicado”; foco vai ao novo comentário ou permanece na ação conforme regra validada no protótipo, sem busca visual |

Se a solução implementada usar desfazer/excluir no lugar da revisão, o aviso precisa informar o prazo ou a disponibilidade da reversão, ser alcançável por teclado e ser anunciado. Falha da API preserva o texto para nova tentativa.

Rastreabilidade: W05 e W06; A11Y-003, A11Y-009 e A11Y-014.

## F06 — administrar clube, livro e encontro

Objetivo: operar menus e os oito diálogos por teclado, com ação destrutiva protegida e retorno de foco.

### Menu

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Focar “Ações do clube” ou “Ações do encontro” | `E:` recolhido; opções fechadas não entram na ordem de foco |
| 2 | Abrir com `Enter` ou `Espaço` | `E:` expandido; opções Editar e Excluir ficam disponíveis |
| 3 | Pressionar `Escape` | menu fecha; `F:` acionador; nenhuma ação é executada |
| 4 | Reabrir e escolher uma opção | menu fecha; diálogo nomeado abre; `F:` alvo inicial de W08 |
| 5 | Clicar fora em ensaio de ponteiro | clique concluído fecha sem ativar o elemento sob o ponteiro |

### Diálogo de formulário

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Abrir Criar/Editar | conteúdo de fundo fica inerte; título nomeia a ação e o objeto; `F:` primeiro campo |
| 2 | Percorrer com `Tab` e `Shift+Tab` | foco circula entre controles do diálogo e permanece visível |
| 3 | Provocar erro | erro se liga ao campo, preserva demais valores e anuncia uma vez |
| 4 | Pressionar `Escape`, Fechar ou Cancelar | fecha sem salvar; `F:` acionador original, se ainda existir |
| 5 | Reabrir, preencher e salvar | botão ocupado impede duplicidade; sucesso fecha e anuncia resultado; novo contexto recebe foco coerente |

### Diálogo de confirmação

| Passo | Interação e resposta esperada | Anotações |
| ---: | --- | --- |
| 1 | Abrir Excluir/Sair | `F:` Cancelar; texto identifica objeto e consequências |
| 2 | Pressionar o ponteiro no fundo e terminar dentro do diálogo | não fecha nem executa ação |
| 3 | Ativar Cancelar ou `Escape` | fecha sem alteração; `F:` acionador |
| 4 | Confirmar com dados descartáveis | botão ocupado; ação ocorre uma vez; foco vai ao contexto sobrevivente e resultado é anunciado |

### Cobertura das oito variações

| Objeto | Criar | Editar | Excluir/sair | Origem principal |
| --- | :---: | :---: | :---: | --- |
| Clube | ✓ | ✓ | ✓ excluir + ✓ sair | T03, T04 |
| Livro | ✓ cadastrar | — | — | T05 |
| Encontro | ✓ | ✓ | ✓ excluir | T07, T08 |

Rastreabilidade: W03–W06, W08 e W09; A11Y-001, A11Y-003, A11Y-009 e A11Y-012–A11Y-014.

## Transições compartilhadas de foco

| Evento | Origem | Destino esperado |
| --- | --- | --- |
| Navegação SPA | link ou ação que troca rota | `h1` da nova rota |
| Link de salto | primeiro foco da página autenticada | início do `main` atual |
| Abrir diálogo de formulário | acionador | primeiro campo |
| Abrir confirmação destrutiva | acionador | Cancelar |
| Fechar/cancelar diálogo | qualquer controle interno | acionador original |
| Salvar e permanecer na rota | ação principal | acionador ou objeto atualizado, conforme continuidade da tarefa |
| Excluir objeto atual | confirmação | `h1` da rota sobrevivente |
| Abrir menu | acionador | acionador mantém contexto; próxima tabulação alcança primeira opção |
| Fechar menu | opção/acionador | acionador |
| Erro de formulário | envio | resumo ou primeiro campo inválido |
| Atualização alternável | botão | o mesmo botão com nome/estado atualizado |

## Matriz de cobertura dos fluxos

| Fluxo | Telas | Wireframes | Componentes principais | Saída observável |
| --- | --- | --- | --- | --- |
| F01 | T01, T02, T03, T09 | W01, W02, W03, W07 | C01, C06–C09 | sessão/contexto corretos e erros recuperáveis |
| F02 | T03, T04 | W02–W04 | C01–C03, C07–C09 | associação e favorito compreensíveis |
| F03 | T04–T06 | W02, W04, W05 | C02, C03, C07–C09 | leitura localizada e estado alterado |
| F04 | T04, T07, T08 | W02, W04, W06 | C02, C03, C07–C09 | presença alternada e anunciada |
| F05 | T06, T08 | W05, W06 | C06, C07, C09 | comentário corrigido, protegido e publicado |
| F06 | T03–T05, T07, T08 | W03–W06, W08, W09 | C04–C07 | menu/diálogo operáveis e foco restaurado |

## Decisões encaminhadas para a Semana 6

O protótipo de alta fidelidade deve materializar, sem mudar as relações definidas aqui:

- tokens de cor que atendam contraste de texto, componentes e foco;
- indicador de foco visível em todos os fundos e em cores forçadas;
- tipografia, largura de linha, espaçamento e alvos de interação;
- layouts em 1280, 640 e 320 CSS px e cenários equivalentes de zoom;
- aparência distinta e não exclusivamente cromática para erro, sucesso, atual, pressionado, desabilitado e destrutivo;
- duração e posição de status, alertas, revisão de comentário e opção de desfazer, se escolhida;
- comparação visual entre estado padrão, menu aberto e diálogo aberto.

## Critério de conclusão

Os fluxos estão prontos para prototipação porque F01–F06 possuem início, sequência, saída, erro/recuperação, foco, anúncio, estado e rastreabilidade. Nenhuma decisão exige que a pessoa deduza função ou condição apenas por cor, ícone ou posição.
