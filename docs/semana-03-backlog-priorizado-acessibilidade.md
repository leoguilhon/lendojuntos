# Semana 3 — backlog priorizado de acessibilidade

## Objetivo e regra de ordenação

Este backlog transforma os achados do [relatório inicial da auditoria](semana-03-relatorio-inicial-auditoria.md) em trabalho verificável. A ordem considera, nesta sequência:

1. bloqueio de jornada essencial sem mouse ou sem visão;
2. alcance em componente compartilhado;
3. risco de perda de contexto ou de dados;
4. quantidade de telas e públicos afetados;
5. dependências técnicas e possibilidade de reteste.

### Prioridades

| Prioridade | Tratamento esperado |
| --- | --- |
| P0 | iniciar no primeiro lote de implementação; bloqueio crítico ou fundação transversal |
| P1 | corrigir no ciclo principal antes da avaliação final |
| P2 | corrigir depois das fundações ou manter justificado no backlog residual |
| VAL | executar como validação complementar; pode gerar novos itens ou ajustar severidade |

“Pronto” exige implementação, revisão e evidência de reteste. Apenas alterar o código não encerra um item.

## Visão priorizada

| Ordem | ID | Prioridade | Entrega | Dependências | Semana-alvo |
| ---: | --- | :---: | --- | --- | :---: |
| 1 | A11Y-001 | P0 | tornar os oito diálogos nomeados, modais e previsíveis no foco | nenhuma | 8 |
| 2 | A11Y-004 | P0 | criar foco global visível com contraste suficiente | nenhuma | 7 |
| 3 | A11Y-005 | P0 | adicionar link de salto e destino principal consistente | A11Y-004 | 7 |
| 4 | A11Y-002 | P0 | gerenciar título e foco nas mudanças de rota | A11Y-004 | 7/11 |
| 5 | A11Y-003 | P0 | anunciar feedback, erro, carregamento e conclusão | A11Y-002 | 9–11 |
| 6 | A11Y-006 | P1 | substituir cartões simulados por composição com links nativos | A11Y-004 | 10 |
| 7 | A11Y-010 | P1 | expor estados de favorito, curtida e leitura | A11Y-006 | 10 |
| 8 | A11Y-007 | P1 | eliminar overflow de login/cadastro em 320 CSS px | nenhuma | 9 |
| 9 | A11Y-008 | P1 | corrigir contraste de textos e tokens de cor | nenhuma | 7 |
| 10 | A11Y-009 | P1 | associar erros aos campos e oferecer correção compreensível | A11Y-003 | 9 |
| 11 | A11Y-011 | P1 | identificar a finalidade dos campos com `autocomplete` | nenhuma | 9 |
| 12 | A11Y-012 | P2 | adequar nome, teclado e fechamento dos menus de ações | A11Y-004 | 8 |
| 13 | A11Y-013 | P2 | mover fechamento do fundo para evento cancelável de clique | A11Y-001 | 8 |
| 14 | A11Y-014 | P2 | oferecer revisão, confirmação ou reversão para dados persistentes | A11Y-003 | 9–11 |
| 15 | VAL-001 | VAL | executar os seis fluxos com NVDA em sessão dedicada | P0 e P1 implementados | 13 |
| 16 | VAL-002 | VAL | validar zoom real, espaçamento de texto e contraste do Windows | P0 e P1 implementados | 13 |

## Critérios de aceite por item

### A11Y-001 — diálogos acessíveis

Abrangência: `Modal.tsx` e os oito diálogos de T03–T08.

- O diálogo usa `aria-labelledby` apontando para um título único e `aria-modal="true"`.
- Ao abrir, o foco entra em um alvo definido dentro do diálogo.
- `Tab` e `Shift+Tab` não alcançam o conteúdo de fundo enquanto estiver aberto.
- `Escape`, Fechar e Cancelar fecham sem executar a ação principal.
- Ao fechar, o foco retorna ao acionador, se ele ainda existir.
- O fundo fica inerte para teclado e tecnologia assistiva.
- Cada uma das oito variações passa pelo roteiro de abrir, percorrer, cancelar e retornar.

### A11Y-002 — contexto nas rotas

Abrangência: `AppRoutes.tsx`, T01–T09 e estados de carregamento/erro.

- Cada rota recebe título descritivo no formato “Tela — LendoJuntos”.
- Após navegação SPA, o foco vai ao `h1` ou ao contêiner principal conforme regra documentada.
- Login, retorno, exclusão e saída anunciam um contexto coerente e não deixam foco no `body`.
- Voltar pelo navegador mantém comportamento previsível.

### A11Y-003 — mensagens dinâmicas

Abrangência: feedbacks, erros, carregamentos e atualizações em T01–T09.

- Sucesso e atualização não urgente usam região de status apropriada.
- Erro que exige ação usa anúncio assertivo sem repetir continuamente.
- Estado de carregamento expõe nome e condição ocupada quando aplicável.
- Criar, editar, favoritar, curtir, confirmar presença e comentar são anunciados uma única vez.
- O anúncio não move foco automaticamente quando isso prejudicar a tarefa.

### A11Y-004 — foco visível

Abrangência: todos os elementos interativos e temas suportados.

- O indicador tem área perceptível e diferença de contraste de pelo menos 3:1 nos fundos adjacentes.
- Links, botões, campos, cartões temporariamente mantidos e `summary` usam tratamento consistente.
- O foco não é removido por CSS e permanece visível em 320 CSS px e cores forçadas.
- Estados normal, hover, ativo e desabilitado não ocultam o foco.

### A11Y-005 — ignorar blocos

Abrangência: layout autenticado T03–T09.

- O primeiro controle focável oferece “Ir para o conteúdo principal”.
- O link fica visível ao receber foco e aponta para um `main` único com destino válido.
- A ativação posiciona o foco/início de leitura no conteúdo sem alterar a rota.

### A11Y-006 — cartões e links nativos

Abrangência: cartões de clubes, livros, encontros e painéis clicáveis em T03–T08.

- A navegação usa `Link`/`a` nativo com destino real, sem `role="link"` em `article`/`section`.
- Favorito ou curtida não fica dentro de outro controle interativo.
- Nome e destino do link são claros e a ordem de foco acompanha a ordem visual.
- Enter ativa o link; botão separado executa apenas sua própria ação.

### A11Y-007 — reflow da autenticação

Abrangência: T01 e T02.

- Em viewport útil de 320 CSS px, `scrollWidth` não supera `clientWidth`.
- Logo, título, formulário e ações permanecem visíveis e operáveis.
- O resultado é repetido com zoom real de 400% em viewport equivalente, salvo exceções normativas.

### A11Y-008 — contraste de texto

Abrangência: tokens `--color-text-faint`, `--color-accent` e todos os fundos em que são usados.

- Texto comum atinge pelo menos 4,5:1; texto grande, quando aplicável, pelo menos 3:1.
- Marca, metadados, `eyebrow`, contagens, datas e estados são medidos em seus fundos reais.
- Hover e estado ativo também atendem e não dependem só da cor.
- A tabela antes/depois registra valores hexadecimais e razões calculadas.

### A11Y-009 — identificação e sugestão de erros

Abrangência: formulários de T01–T09.

- Campo inválido usa `aria-invalid="true"` e referencia sua mensagem por `aria-describedby`.
- A mensagem identifica o campo, descreve o problema e sugere correção quando conhecida.
- O resumo ou primeiro erro fica localizável após envio sem apagar dados válidos.
- Validação do servidor e validação do navegador não produzem instruções conflitantes.

### A11Y-010 — estados de controles

Abrangência: favorito de clube, curtida de livro, situação da leitura e presença.

- Alternâncias expõem estado programático com `aria-pressed` ou padrão semântico equivalente.
- Situação da leitura possui nome de grupo, opção atual e estado desabilitado compreensíveis.
- Nome e estado são anunciados corretamente antes e depois da alteração.
- Texto ou nome acessível continua distinguindo estados sem depender de cor ou emoji.

### A11Y-011 — finalidade dos campos

Abrangência: login, cadastro e perfil.

- Nome usa `autocomplete="name"`, e-mail usa `email`, senha de login usa `current-password` e senha de cadastro usa `new-password`.
- Os tokens são confirmados na árvore de acessibilidade e não impedem gerenciadores de senha nem colagem.

### A11Y-012 — menus de ações

Abrangência: menu do clube e do encontro.

- O acionador tem nome textual contextual, sem depender da pronúncia do emoji.
- Expandido/recolhido é exposto programaticamente.
- `Escape` fecha o menu e mantém foco no acionador.
- Foco não alcança opções quando o menu está fechado; clique externo fecha sem ativação acidental.

### A11Y-013 — cancelamento de ponteiro

Abrangência: fundo dos diálogos.

- Pressionar o ponteiro (`mousedown`/`pointerdown`) não fecha imediatamente.
- Fechamento ocorre no clique concluído no próprio fundo, sem ocorrer quando o gesto termina dentro do diálogo.
- Há sempre alternativas por teclado e botão nomeado.

### A11Y-014 — prevenção de erro em dados

Abrangência: comentário, perfil, clube, livro, encontro e exclusões.

- Cada alteração persistente relevante oferece reversão, verificação antes do envio ou confirmação.
- Exclusões mantêm confirmação explícita com objeto e consequência identificados.
- Para comentários, existe desfazer/excluir ou etapa de revisão antes da publicação.
- Reteste confirma que a proteção é acessível por teclado e leitor de tela.

### VAL-001 — NVDA

- Executar F01–F06 em sessão dedicada com NVDA e navegador em primeiro plano.
- Registrar landmarks, títulos, nomes, estados, modo de navegação/foco, mensagens e bloqueios.
- Repetir diálogos e menus, anexando versão do ambiente e fala relevante em paráfrase.
- Abrir novos itens no backlog para falhas não cobertas e vincular a evidência.

### VAL-002 — apresentação adaptável

- Testar 200% e 400% de zoom real, retrato/paisagem e strings longas.
- Aplicar espaçamento de texto do critério 1.4.12 sem perda de conteúdo ou operação.
- Usar ao menos um tema real de contraste do Windows e conferir foco, estados, campos e erros.
- Resolver os estados PV de 1.4.12, 1.4.13, 2.4.5 e 2.5.3 na matriz.

## Definição de pronto do backlog

Um item só muda para concluído quando contém:

- código e cobertura de todas as telas indicadas;
- lint e build sem erro;
- teste manual de teclado no fluxo afetado;
- verificação automática pertinente, sem tratá-la como prova isolada;
- evidência antes/depois e critérios WCAG reavaliados;
- limitações remanescentes registradas, quando houver.

## Sequência recomendada de lotes

| Lote | Itens | Resultado esperado |
| --- | --- | --- |
| Fundações | A11Y-004, 005, 002, 008 | navegação global e percepção do foco/contexto estabilizadas |
| Sobreposições | A11Y-001, 012, 013 | diálogos e menus previsíveis para teclado e leitor de tela |
| Formulários e estados | A11Y-003, 009, 011, 014 | entradas, erros, confirmações e persistência compreensíveis |
| Conteúdo e interação | A11Y-006, 010, 007 | cartões, estados e reflow corrigidos |
| Validação final | VAL-001, VAL-002 | critérios pendentes resolvidos e backlog residual produzido |

Esta sequência respeita as semanas-alvo do cronograma, mas permite antecipar correções quando uma dependência técnica exigir.
