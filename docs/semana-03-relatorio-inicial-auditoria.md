# Semana 3 — relatório inicial da auditoria de acessibilidade

## Identificação da linha de base

| Item | Registro |
| --- | --- |
| Período | 07/09/2026 a 13/09/2026 |
| Data de consolidação | 12/09/2026, fuso America/Sao_Paulo |
| Revisão avaliada | `04f7b66` (`main`) |
| Produto | LendoJuntos web responsivo |
| Meta técnica | WCAG 2.2 níveis A e AA, apoiada pelo eMAG 3.1 |
| Superfície | 9 telas, 10 sobreposições/menus e 6 fluxos críticos |
| Entregas relacionadas | este relatório e o [backlog priorizado](semana-03-backlog-priorizado-acessibilidade.md) |

## Objetivo

Estabelecer uma linha de base verificável antes das correções de acessibilidade. A auditoria relaciona barreiras observadas às jornadas do produto, aos critérios WCAG 2.2 A/AA e às recomendações do eMAG, além de produzir a ordem inicial de tratamento.

Este relatório não declara conformidade. “Atende na amostra” significa somente que não foi encontrada falha no recorte e no método empregados; não equivale a uma avaliação de conformidade integral. Critérios dependentes de teste manual específico permanecem identificados como pendentes.

## Escopo consolidado

### Incluído

- login, cadastro e saída;
- dashboard, ingresso e favorito de clubes;
- detalhes e administração de clube;
- listagem, detalhes, estado, curtida e comentários de livros;
- listagem, detalhes, presença e comentários de encontros;
- edição de perfil;
- cabeçalho, navegação, cartões, formulários, feedbacks, menus e oito diálogos;
- variações em 1280, 640 e 320 CSS px, teclado e cores forçadas já ensaiadas na Semana 2.

### Fora do recorte atual

- aplicativo nativo, audiolivros e distribuição de obras;
- conteúdo multimídia, inexistente no produto atual;
- declaração formal de conformidade WCAG;
- compatibilidade conclusiva com NVDA, que requer uma sessão manual dedicada no conteúdo web;
- testes com participantes, previstos para a fase de validação da intervenção.

## Método e evidências

1. O inventário da Semana 2 foi usado como amostra: T01–T09, C01–C10 e F01–F06.
2. Foram reinspecionados os componentes React, as rotas, os formulários, os estados dinâmicos e os estilos da revisão avaliada.
3. O roteiro foi reexecutado em 12/09/2026 no Chrome 153.0.8010.36 contra a stack local com dados de demonstração: autenticou até `/dashboard`, percorreu as 9 telas, confirmou nome vazio no diálogo, título único, cores forçadas ativas e o mesmo resultado de reflow (9/9 sem overflow em 1280 e 640 CSS px; 7/9 em 320 CSS px). A sequência de teclado e o ensaio NVDA continuam apoiados pelo registro detalhado de 03/09/2026, na mesma revisão da aplicação.
4. O contraste foi calculado conforme luminância relativa. As combinações problemáticas medidas foram `#7b8078`/`#fffdf9` = 3,97:1, `#7b8078`/`#f6f0e6` = 3,56:1, `#c67143`/`#fffdf9` = 3,54:1 e `#c67143`/`#f6f0e6` = 3,17:1.
5. Lint, build e testes de serviço foram executados para confirmar que a revisão auditada permanece tecnicamente íntegra; esses comandos não substituem testes de acessibilidade.

Evidências de origem:

- [inventário de telas e fluxos](semana-02-inventario-telas-fluxos.md);
- [notas dos recursos assistivos](semana-02-notas-tecnologias-assistivas.md);
- [checklist eMAG](semana-02-checklist-emag.md);
- [roteiro reproduzível de navegador](semana-02-experimento-browser.mjs);
- `frontend/src/components/Modal.tsx`, `AppLayout.tsx` e `ActionMenu.tsx`;
- `frontend/src/pages/`, `frontend/src/routes/AppRoutes.tsx`, `frontend/src/index.css` e `frontend/index.html`.

## Escala de severidade

| Severidade | Regra adotada |
| --- | --- |
| Crítica | bloqueia ou desvia uma jornada essencial para pessoas que dependem de teclado ou tecnologia assistiva, sem alternativa confiável |
| Alta | causa dificuldade relevante, afeta várias telas ou quebra um critério A/AA em componente recorrente |
| Média | é localizada ou possui contorno, mas reduz compreensão, previsibilidade ou robustez |
| Baixa | impacto limitado, predominantemente de consistência ou refinamento |

Prioridade de implementação é registrada separadamente no backlog, porque considera também alcance, dependências e custo de correção.

## Resultado executivo

- 55 critérios WCAG 2.2 A/AA foram triados: 22 atendem na amostra, 16 não atendem, 13 não são aplicáveis ao conteúdo atual e 4 dependem de validação adicional.
- Foram consolidados 14 achados acionáveis e 2 tarefas de validação complementar.
- A barreira mais grave está no componente compartilhado de diálogo: o foco permanece e circula no fundo, não retorna ao acionador e o diálogo é exposto sem nome acessível.
- As sete telas autenticadas não apresentaram overflow na largura de 320 CSS px; login e cadastro apresentaram.
- Há bases positivas: idioma da página definido como `pt-BR`, um `h1` nas nove telas, landmarks `header`/`nav`/`main` nas telas autenticadas, controles principais alcançáveis por teclado e redução de movimento implementada.

## Achados da linha de base

| ID | Severidade | Barreira confirmada | Evidência e alcance | Critérios relacionados |
| --- | --- | --- | --- | --- |
| A11Y-001 | Crítica | Diálogos não têm nome acessível nem ciclo de foco correto. | Nos oito usos de `Modal`, o foco não entra no diálogo, alcança o fundo, termina no `body` após `Escape` e a árvore AX expõe nome vazio. | 2.4.3, 2.4.11, 4.1.2 |
| A11Y-002 | Alta | Mudanças de rota não atualizam título nem posicionam o foco no novo contexto. | As nove telas mantêm `document.title = "LendoJuntos"`; o login remove o elemento focado sem destino equivalente. | 2.4.2, 2.4.3 |
| A11Y-003 | Alta | Feedbacks, erros e carregamentos dinâmicos não são anunciados. | Mensagens são parágrafos comuns, sem `role="status"`, `role="alert"`, `aria-live` ou `aria-busy`, em T01–T09. | 4.1.3 |
| A11Y-004 | Alta | O indicador de foco customizado não atinge contraste mínimo e é inconsistente em links. | Contorno de 3 px com `rgb(198 113 67 / 20%)`, contraste estimado de 1,23:1–1,25:1 em fundos claros. | 1.4.11, 2.4.7 |
| A11Y-005 | Alta | Não há mecanismo para pular blocos repetidos. | A primeira sequência autenticada percorre marca, navegação e usuário antes do conteúdo; inexiste link para `main`. | 2.4.1 |
| A11Y-006 | Alta | Cartões simulam links e contêm botões focáveis. | `article role="link" tabindex="0"` envolve favorito ou curtida em T03–T08, criando semântica e ordem de interação ambíguas. | 1.3.1, 4.1.2 |
| A11Y-007 | Alta | Login e cadastro não refluem a 320 CSS px. | Documento medido em 376 px no login e 333 px no cadastro; `.auth-panel-head` e contêineres públicos foram apontados. | 1.4.10 |
| A11Y-008 | Alta | Textos pequenos usam combinações abaixo de 4,5:1. | `--color-text-faint` chega a 3,56:1 e `--color-accent` a 3,17:1 nos fundos em uso; aparecem em metadados e rótulos de 0,72–0,84 rem. | 1.4.3 |
| A11Y-009 | Alta | Erros de formulário não são associados ao campo e nem sempre sugerem correção. | Login e cadastro exibem erro global; demais formulários dependem de validação nativa ou feedback geral, sem `aria-describedby`/`aria-invalid`. | 3.3.1, 3.3.3 |
| A11Y-010 | Alta | Estados selecionado/pressionado não são expostos de forma uniforme. | Favorito, curtida e situação de leitura usam classe visual e mudança de rótulo, mas não um padrão de grupo nem `aria-pressed`/seleção programática. | 1.3.1, 4.1.2 |
| A11Y-011 | Média | Campos de identificação não expõem sua finalidade. | Nome, e-mail e senha não usam tokens `autocomplete` em login e cadastro. | 1.3.5 |
| A11Y-012 | Média | Menus de ações não têm comportamento completo e nome claro por padrão. | O `summary` usa “⚙️”; não há fechamento por `Escape` nem retorno de foco explicitamente controlado. | 2.1.1, 2.4.6, 4.1.2 |
| A11Y-013 | Média | Fechar o diálogo pelo fundo ocorre no evento de pressionar o ponteiro. | `modal-backdrop` chama `onClose` em `onMouseDown`, antes de completar o clique. | 2.5.2 |
| A11Y-014 | Média | Algumas alterações persistentes não oferecem reversão ou revisão. | Publicação de comentário e atualizações de dados são imediatas; comentários não têm desfazer ou confirmação anterior. | 3.3.4 |

## Matriz WCAG 2.2 A/AA da linha de base

Legenda: **A** = atende na amostra; **N** = não atende; **NA** = não aplicável ao conteúdo atual; **PV** = pendente de validação manual específica.

### 1. Perceptível

| Critério | Estado | Evidência resumida |
| --- | :---: | --- |
| 1.1.1 Conteúdo não textual | A | logos possuem alternativa textual; não há outras imagens de conteúdo |
| 1.2.1 Apenas áudio e apenas vídeo, pré-gravados | NA | sem mídia |
| 1.2.2 Legendas, pré-gravadas | NA | sem mídia |
| 1.2.3 Audiodescrição ou alternativa em mídia | NA | sem mídia |
| 1.2.4 Legendas, ao vivo | NA | sem mídia ao vivo |
| 1.2.5 Audiodescrição, pré-gravada | NA | sem mídia |
| 1.3.1 Informações e relações | N | grupos/estados e cartões simulados não têm semântica suficiente |
| 1.3.2 Sequência com significado | A | DOM segue a sequência visual na amostra |
| 1.3.3 Características sensoriais | A | instruções não dependem apenas de posição, forma ou som |
| 1.3.4 Orientação | A | não há bloqueio de retrato ou paisagem |
| 1.3.5 Identificar finalidade de entrada | N | faltam tokens `autocomplete` |
| 1.4.1 Uso de cor | A | estados amostrados têm texto ou nome além da cor |
| 1.4.2 Controle de áudio | NA | sem áudio automático |
| 1.4.3 Contraste mínimo | N | quatro combinações de texto pequeno ficaram entre 3,17:1 e 3,97:1 |
| 1.4.4 Redimensionar texto | A | amostra equivalente a 200% sem overflow |
| 1.4.5 Imagens de texto | A | somente marca/logotipo, coberta pela exceção |
| 1.4.10 Reflow | N | T01 e T02 têm overflow em 320 CSS px |
| 1.4.11 Contraste não textual | N | indicador de foco estimado abaixo de 3:1 |
| 1.4.12 Espaçamento de texto | PV | requer aplicação completa das métricas do critério |
| 1.4.13 Conteúdo em hover ou foco | PV | `title` e estados de foco precisam de ensaio manual por navegador |

### 2. Operável

| Critério | Estado | Evidência resumida |
| --- | :---: | --- |
| 2.1.1 Teclado | A | ações principais da amostra são alcançáveis/acionáveis; pendências de foco são classificadas em 2.4 |
| 2.1.2 Sem bloqueio do teclado | A | nenhum aprisionamento permanente identificado |
| 2.1.4 Atalhos por tecla de caractere | NA | não há atalhos desse tipo |
| 2.2.1 Ajustável por tempo | NA | não há limite de tempo de sessão ou tarefa na interface |
| 2.2.2 Pausar, parar, ocultar | A | animações são breves e há `prefers-reduced-motion` |
| 2.3.1 Três flashes ou abaixo do limite | A | não há conteúdo intermitente |
| 2.4.1 Ignorar blocos | N | falta link de salto para o conteúdo principal |
| 2.4.2 Página com título | N | título único “LendoJuntos” nas nove telas |
| 2.4.3 Ordem do foco | N | diálogo permite foco no fundo e não restaura o acionador |
| 2.4.4 Finalidade do link no contexto | A | links amostrados têm texto contextual |
| 2.4.5 Várias formas | PV | arquitetura autenticada precisa de avaliação de localização alternativa |
| 2.4.6 Cabeçalhos e rótulos | A | títulos e rótulos descrevem a finalidade na amostra, salvo menu tratado em 4.1.2 |
| 2.4.7 Foco visível | N | contorno customizado tem contraste insuficiente e aplicação desigual |
| 2.4.11 Foco não obscurecido (mínimo) | N | foco pode permanecer completamente atrás do modal |
| 2.5.1 Gestos de ponteiro | NA | sem gestos multiponto ou dependentes de caminho |
| 2.5.2 Cancelamento de ponteiro | N | fechamento do modal ocorre em `mousedown` |
| 2.5.3 Rótulo no nome | PV | símbolos visíveis e nomes programáticos precisam de conferência com AT |
| 2.5.4 Acionamento por movimento | NA | não há acionamento por movimento |
| 2.5.7 Movimentos de arrastar | NA | não há arraste |
| 2.5.8 Tamanho do alvo (mínimo) | A | controles amostrados atingem pelo menos 24 CSS px ou se enquadram em exceção |

### 3. Compreensível

| Critério | Estado | Evidência resumida |
| --- | :---: | --- |
| 3.1.1 Idioma da página | A | `html lang="pt-BR"` |
| 3.1.2 Idioma das partes | A | não foram encontrados trechos que exijam mudança de idioma |
| 3.2.1 Em foco | A | foco sozinho não dispara mudança de contexto |
| 3.2.2 Em entrada | A | alteração de campos não navega automaticamente |
| 3.2.3 Navegação consistente | A | cabeçalho autenticado mantém ordem e posição |
| 3.2.4 Identificação consistente | A | ações recorrentes mantêm nomenclatura na amostra |
| 3.2.6 Ajuda consistente | NA | não há mecanismo de ajuda repetido no produto atual |
| 3.3.1 Identificação do erro | N | erros globais não identificam programaticamente o campo |
| 3.3.2 Rótulos ou instruções | A | campos possuem rótulos textuais associados por encapsulamento |
| 3.3.3 Sugestão de erro | N | mensagens não garantem orientação de correção quando conhecida |
| 3.3.4 Prevenção de erro legal, financeiro ou de dados | N | alterações persistentes como comentário não têm reversão ou revisão |
| 3.3.7 Entrada redundante | NA | não há processo multietapas que solicite novamente o mesmo dado |
| 3.3.8 Autenticação acessível (mínimo) | A | login aceita senha e não bloqueia colagem nem exige teste cognitivo |

### 4. Robusto

| Critério | Estado | Evidência resumida |
| --- | :---: | --- |
| 4.1.2 Nome, função, valor | N | diálogo sem nome e estados de controles/grupos incompletos |
| 4.1.3 Mensagens de status | N | feedbacks e carregamentos não usam região viva apropriada |

## Cobertura das jornadas

| Fluxo | Resultado da linha de base | Principais IDs |
| --- | --- | --- |
| F01 Criar conta, entrar e sair | concluível por teclado; contexto pós-rota, erros, finalidade dos campos e reflow têm barreiras | A11Y-002, 007, 009, 011 |
| F02 Localizar e ingressar em clube | concluível visualmente; cartão, estado e confirmação dinâmica exigem correção | A11Y-003, 006, 010 |
| F03 Consultar leitura e histórico | conteúdo disponível; cartões e seleção de situação têm semântica incompleta | A11Y-006, 010 |
| F04 Consultar encontro e confirmar presença | conteúdo disponível; confirmação de presença não é anunciada | A11Y-003, 006 |
| F05 Ler e publicar comentários | envio disponível; resultado não é anunciado e não há reversão | A11Y-003, 009, 014 |
| F06 Administrar clube, livro e encontro | afetado pela barreira crítica do componente de diálogo | A11Y-001, 009, 012, 013 |

## Limitações e próximos testes

- O ensaio NVDA da Semana 2 no conteúdo web foi inconclusivo por limitação de foco entre processos. A árvore de acessibilidade auxilia o diagnóstico, mas não substitui o leitor de tela.
- A largura de 320 CSS px aproxima o reflow a 400%; zoom real, conteúdo longo, modais e menus abertos ainda precisam de inspeção visual.
- Cores forçadas foram emuladas no Chromium. Um tema de contraste real do Windows continua necessário.
- Critérios marcados PV devem ser resolvidos pelas tarefas `VAL-001` e `VAL-002` do backlog.
- Correções serão retestadas no ciclo diagnosticar–corrigir–retestar, preservando esta revisão como linha de base.

## Critério de conclusão da Semana 3

A atividade é considerada concluída no repositório quando:

- escopo, amostra, método e limitações estão registrados;
- os 55 critérios A/AA estão triados sem alegação indevida de conformidade;
- cada barreira acionável possui ID, severidade, evidência e critério relacionado;
- o backlog possui prioridade, dependências e critérios de aceite verificáveis;
- relatório e backlog apontam um para o outro e usam os mesmos identificadores.
