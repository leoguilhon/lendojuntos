# Semana 1 — Parte 2: acessibilidade digital e WCAG 2.2 A/AA

## Objetivo e resultado

Esta etapa transforma o estudo inicial de acessibilidade digital e da WCAG 2.2 em um referencial aplicável ao LendoJuntos. O resultado é uma matriz de 55 critérios de sucesso dos níveis A e AA, com indicação preliminar de contexto e forma de verificação.

A matriz é um instrumento de planejamento. Ela não representa uma auditoria e não declara que o LendoJuntos está em conformidade. Os estados de atendimento serão preenchidos somente depois da avaliação da linha de base prevista para a Semana 3.

## Fichamento

### Acessibilidade digital

Acessibilidade digital consiste em permitir que pessoas com diferentes capacidades percebam, compreendam, naveguem, interajam e contribuam no ambiente digital. No projeto, isso significa não depender de um único sentido, dispositivo de entrada ou modo de compreensão para realizar as jornadas essenciais.

A WCAG 2.2 organiza a acessibilidade em quatro princípios:

1. **Perceptível:** informações e componentes devem ser apresentados de formas que as pessoas consigam perceber.
2. **Operável:** componentes e navegação devem funcionar com diferentes modos de interação.
3. **Compreensível:** conteúdo e comportamento da interface devem ser previsíveis e claros.
4. **Robusto:** o conteúdo deve ser interpretado de forma confiável por navegadores e tecnologias assistivas.

Esses princípios contêm 13 diretrizes. Os critérios de sucesso são requisitos testáveis e independentes de tecnologia. As técnicas e os documentos *Understanding* ajudam na implementação, mas são materiais informativos, não substituem o texto normativo.

### Níveis A e AA

- O nível **A** é o nível mínimo de conformidade.
- O nível **AA** exige o atendimento de todos os critérios A e AA aplicáveis; não basta selecionar apenas alguns critérios AA.
- A conformidade se aplica à página completa, às variações responsivas e a todas as etapas de um processo completo incluído no escopo.
- Tecnologias usadas para satisfazer os critérios precisam ser compatíveis com acessibilidade, e conteúdo que não seja usado para conformidade não pode interferir no restante da página.

O alvo técnico do LendoJuntos será WCAG 2.2 AA. Isso abrange 31 critérios de nível A e 24 de nível AA. O critério 4.1.1, *Parsing*, não integra a matriz porque foi removido na WCAG 2.2; ele só deverá ser reportado se outra exigência obrigar a avaliação por WCAG 2.0 ou 2.1.

### Novidades da WCAG 2.2 dentro do alvo

Dos nove critérios introduzidos na WCAG 2.2, seis pertencem aos níveis A ou AA e entram no escopo do projeto:

| Critério | Nível | Consequência inicial para o LendoJuntos |
| --- | --- | --- |
| 2.4.11 Foco não obscurecido (mínimo) | AA | cabeçalhos, modais e painéis não podem esconder por completo o componente em foco |
| 2.5.7 Movimentos de arrastar | AA | uma função baseada em arrastar precisa ter alternativa sem arraste |
| 2.5.8 Tamanho do alvo (mínimo) | AA | alvos devem ter tamanho ou espaçamento suficiente, consideradas as exceções do critério |
| 3.2.6 Ajuda consistente | A | mecanismos de ajuda repetidos devem manter posição relativa consistente |
| 3.3.7 Entrada redundante | A | processos não devem exigir novamente informação já fornecida, salvo as exceções |
| 3.3.8 Autenticação acessível (mínimo) | AA | login não deve depender de teste cognitivo sem alternativa ou mecanismo de apoio |

## Matriz WCAG 2.2 A/AA v1

### Como interpretar

- **Essencial:** diretamente relacionado aos fluxos e componentes atuais e deve receber prioridade na auditoria.
- **Aplicável:** deve ser verificado no produto, ainda que não seja o foco principal de uma jornada.
- **Condicional:** passa a ser exigido quando o tipo de conteúdo ou interação descrito existir.
- **Sem conteúdo atual:** não foi identificado esse tipo de conteúdo na inspeção inicial; a situação deve ser reconfirmada na auditoria.

Os títulos em português abaixo são traduções de trabalho. O número de cada critério aponta para o texto normativo em inglês.

### 1. Perceptível

| Critério | Nível | Contexto inicial | Verificação prevista |
| --- | --- | --- | --- |
| [1.1.1 Conteúdo não textual](https://www.w3.org/TR/WCAG22/#non-text-content) | A | Essencial | conferir alternativas de logos, imagens, ícones e eventuais capas de livros |
| [1.2.1 Apenas áudio e apenas vídeo, pré-gravados](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) | A | Sem conteúdo atual | exigir alternativa equivalente se áudio ou vídeo pré-gravado for incluído |
| [1.2.2 Legendas, pré-gravadas](https://www.w3.org/TR/WCAG22/#captions-prerecorded) | A | Sem conteúdo atual | verificar legendas em todo vídeo pré-gravado com áudio |
| [1.2.3 Audiodescrição ou alternativa em mídia, pré-gravada](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) | A | Sem conteúdo atual | oferecer alternativa para informação visual relevante em vídeo |
| [1.2.4 Legendas ao vivo](https://www.w3.org/TR/WCAG22/#captions-live) | AA | Sem conteúdo atual | avaliar legendagem se encontros passarem a ter transmissão ao vivo |
| [1.2.5 Audiodescrição, pré-gravada](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) | AA | Sem conteúdo atual | avaliar audiodescrição para vídeos pré-gravados |
| [1.3.1 Informações e relações](https://www.w3.org/TR/WCAG22/#info-and-relationships) | A | Essencial | inspecionar landmarks, títulos, listas, rótulos, formulários, cartões e diálogos |
| [1.3.2 Sequência significativa](https://www.w3.org/TR/WCAG22/#meaningful-sequence) | A | Essencial | comparar ordem do DOM, leitura visual e navegação por tecnologia assistiva |
| [1.3.3 Características sensoriais](https://www.w3.org/TR/WCAG22/#sensory-characteristics) | A | Aplicável | evitar instruções que dependam apenas de posição, forma, tamanho ou som |
| [1.3.4 Orientação](https://www.w3.org/TR/WCAG22/#orientation) | AA | Aplicável | testar retrato e paisagem sem restrição desnecessária |
| [1.3.5 Identificar o propósito da entrada](https://www.w3.org/TR/WCAG22/#identify-input-purpose) | AA | Essencial | conferir tokens `autocomplete` em login, cadastro e perfil |
| [1.4.1 Uso de cor](https://www.w3.org/TR/WCAG22/#use-of-color) | A | Essencial | verificar estados de leitura, erro, favorito, curtida e presença sem depender só de cor |
| [1.4.2 Controle de áudio](https://www.w3.org/TR/WCAG22/#audio-control) | A | Sem conteúdo atual | impedir áudio automático prolongado sem controle independente |
| [1.4.3 Contraste mínimo](https://www.w3.org/TR/WCAG22/#contrast-minimum) | AA | Essencial | medir contraste de textos normais, grandes, links e textos de estado |
| [1.4.4 Redimensionar texto](https://www.w3.org/TR/WCAG22/#resize-text) | AA | Essencial | testar zoom de texto até 200% sem perda de conteúdo ou função |
| [1.4.5 Imagens de texto](https://www.w3.org/TR/WCAG22/#images-of-text) | AA | Aplicável | manter texto real, tratando logotipos conforme a exceção normativa |
| [1.4.10 Refluxo](https://www.w3.org/TR/WCAG22/#reflow) | AA | Essencial | testar viewport equivalente a 320 CSS px sem rolagem bidimensional indevida |
| [1.4.11 Contraste não textual](https://www.w3.org/TR/WCAG22/#non-text-contrast) | AA | Essencial | medir limites, ícones, estados e indicadores de foco necessários à operação |
| [1.4.12 Espaçamento de texto](https://www.w3.org/TR/WCAG22/#text-spacing) | AA | Essencial | aplicar os ajustes normativos de espaçamento e verificar cortes ou sobreposição |
| [1.4.13 Conteúdo em foco ou hover](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) | AA | Condicional | verificar conteúdo adicional em menus, dicas e painéis quando acionado por foco ou ponteiro |

### 2. Operável

| Critério | Nível | Contexto inicial | Verificação prevista |
| --- | --- | --- | --- |
| [2.1.1 Teclado](https://www.w3.org/TR/WCAG22/#keyboard) | A | Essencial | executar todas as jornadas sem mouse, inclusive cartões, menus e modais |
| [2.1.2 Sem armadilha de teclado](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) | A | Essencial | entrar e sair de todos os componentes com teclado, considerando o comportamento modal esperado |
| [2.1.4 Atalhos de tecla de caractere](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) | A | Condicional | se houver atalhos de uma tecla, permitir desativar, remapear ou limitar ao foco |
| [2.2.1 Tempo ajustável](https://www.w3.org/TR/WCAG22/#timing-adjustable) | A | Aplicável | investigar expiração de sessão e qualquer limite de tempo da interface |
| [2.2.2 Pausar, parar, ocultar](https://www.w3.org/TR/WCAG22/#pause-stop-hide) | A | Condicional | avaliar conteúdo em movimento, atualização automática ou animação prolongada |
| [2.3.1 Três flashes ou abaixo do limite](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) | A | Aplicável | confirmar ausência de conteúdo com flashes acima do limite |
| [2.4.1 Ignorar blocos](https://www.w3.org/TR/WCAG22/#bypass-blocks) | A | Essencial | avaliar landmarks e link para ir ao conteúdo principal |
| [2.4.2 Página com título](https://www.w3.org/TR/WCAG22/#page-titled) | A | Essencial | conferir título descritivo em cada rota e estado relevante da SPA |
| [2.4.3 Ordem de foco](https://www.w3.org/TR/WCAG22/#focus-order) | A | Essencial | testar ordem lógica nas páginas, menus, modais e retorno após fechamento |
| [2.4.4 Finalidade do link no contexto](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) | A | Essencial | verificar nomes compreensíveis e distinção entre destinos repetidos |
| [2.4.5 Várias formas](https://www.w3.org/TR/WCAG22/#multiple-ways) | AA | Aplicável | confirmar que páginas podem ser localizadas por mais de um meio quando exigido |
| [2.4.6 Cabeçalhos e rótulos](https://www.w3.org/TR/WCAG22/#headings-and-labels) | AA | Essencial | conferir hierarquia e rótulos que descrevam assunto ou finalidade |
| [2.4.7 Foco visível](https://www.w3.org/TR/WCAG22/#focus-visible) | AA | Essencial | inspecionar indicador de foco em todos os elementos interativos |
| [2.4.11 Foco não obscurecido, mínimo](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) | AA | Essencial | garantir que cabeçalho, modal ou painel não esconda totalmente o item em foco |
| [2.5.1 Gestos de ponteiro](https://www.w3.org/TR/WCAG22/#pointer-gestures) | A | Condicional | oferecer alternativa simples a gestos multiponto ou baseados em trajetória |
| [2.5.2 Cancelamento do ponteiro](https://www.w3.org/TR/WCAG22/#pointer-cancellation) | A | Aplicável | verificar ativação no evento de soltura e possibilidade de abortar ou desfazer |
| [2.5.3 Rótulo no nome](https://www.w3.org/TR/WCAG22/#label-in-name) | A | Essencial | garantir que o nome acessível contenha o texto visível do controle |
| [2.5.4 Acionamento por movimento](https://www.w3.org/TR/WCAG22/#motion-actuation) | A | Condicional | fornecer operação por interface e opção de desativar movimento, se usado |
| [2.5.7 Movimentos de arrastar](https://www.w3.org/TR/WCAG22/#dragging-movements) | AA | Condicional | oferecer alternativa de ponteiro único sem arraste para qualquer ordenação ou movimentação |
| [2.5.8 Tamanho do alvo, mínimo](https://www.w3.org/TR/WCAG22/#target-size-minimum) | AA | Essencial | medir alvos de 24 por 24 CSS px ou o espaçamento/uma exceção admitida |

### 3. Compreensível

| Critério | Nível | Contexto inicial | Verificação prevista |
| --- | --- | --- | --- |
| [3.1.1 Idioma da página](https://www.w3.org/TR/WCAG22/#language-of-page) | A | Essencial | definir e conferir `lang="pt-BR"` no documento |
| [3.1.2 Idioma das partes](https://www.w3.org/TR/WCAG22/#language-of-parts) | AA | Aplicável | marcar trechos em outro idioma quando a mudança não for reconhecível pelo contexto |
| [3.2.1 Ao receber foco](https://www.w3.org/TR/WCAG22/#on-focus) | A | Essencial | garantir que foco isolado não mude rota, abra janela ou altere contexto |
| [3.2.2 Ao receber entrada](https://www.w3.org/TR/WCAG22/#on-input) | A | Essencial | evitar mudanças inesperadas ao preencher campos ou selecionar opções |
| [3.2.3 Navegação consistente](https://www.w3.org/TR/WCAG22/#consistent-navigation) | AA | Aplicável | manter ordem relativa da navegação repetida entre rotas |
| [3.2.4 Identificação consistente](https://www.w3.org/TR/WCAG22/#consistent-identification) | AA | Aplicável | nomear e representar de modo consistente funções repetidas |
| [3.2.6 Ajuda consistente](https://www.w3.org/TR/WCAG22/#consistent-help) | A | Condicional | manter mecanismos repetidos de ajuda na mesma ordem relativa |
| [3.3.1 Identificação de erro](https://www.w3.org/TR/WCAG22/#error-identification) | A | Essencial | identificar por texto o campo e o motivo do erro |
| [3.3.2 Rótulos ou instruções](https://www.w3.org/TR/WCAG22/#labels-or-instructions) | A | Essencial | conferir rótulos, obrigatoriedade, formato e instruções antes da entrada |
| [3.3.3 Sugestão de erro](https://www.w3.org/TR/WCAG22/#error-suggestion) | AA | Essencial | sugerir correção quando ela for conhecida e segura |
| [3.3.4 Prevenção de erros jurídicos, financeiros ou de dados](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) | AA | Essencial | permitir reversão, conferência ou confirmação em exclusões e alterações de dados |
| [3.3.7 Entrada redundante](https://www.w3.org/TR/WCAG22/#redundant-entry) | A | Condicional | em processos, preencher ou disponibilizar seleção de dados já informados |
| [3.3.8 Autenticação acessível, mínimo](https://www.w3.org/TR/WCAG22/#accessible-authentication-minimum) | AA | Essencial | permitir gerenciadores, colagem e alternativas a testes cognitivos no login |

### 4. Robusto

| Critério | Nível | Contexto inicial | Verificação prevista |
| --- | --- | --- | --- |
| [4.1.2 Nome, função e valor](https://www.w3.org/TR/WCAG22/#name-role-value) | A | Essencial | validar HTML e API de acessibilidade de controles, diálogos, menus e estados |
| [4.1.3 Mensagens de status](https://www.w3.org/TR/WCAG22/#status-messages) | AA | Essencial | verificar anúncios de erros, carregamento, confirmação e atualização sem mover o foco |

## Priorização para o LendoJuntos

A inspeção exploratória do código, sem atribuição de conformidade, destacou estes conjuntos para a futura auditoria:

1. **Navegação e estrutura:** landmarks, link para conteúdo, títulos das rotas, hierarquia de cabeçalhos e ordem de foco.
2. **Componentes interativos:** modal, menu de ações e cartões implementados com comportamento de link.
3. **Formulários e autenticação:** propósito dos campos, instruções, erros associados, mensagens de status e autenticação acessível.
4. **Apresentação responsiva:** contraste, foco visível, zoom, refluxo, espaçamento de texto e tamanho dos alvos.
5. **Conteúdo dinâmico:** operações de favorito, curtida, presença, comentários e estados de carregamento.

## Método de avaliação definido

A aplicação da matriz usará evidências complementares:

- inspeção de HTML, CSS, semântica e nomes/estados acessíveis;
- navegação somente por teclado;
- zoom, viewport reduzido, espaçamento de texto e alto contraste;
- leitor de tela NVDA com navegador;
- ferramentas automáticas, como axe-core e Lighthouse, sem tratá-las como prova isolada de conformidade;
- testes de tarefas das jornadas essenciais e, quando possível, participação de usuários com deficiência.

Cada critério receberá um dos estados: `não avaliado`, `atende na amostra`, `não atende`, `não aplicável` ou `não verificável nesta etapa`. Resultados `não aplicável` precisarão de justificativa, e a amostra, as tecnologias assistivas, os navegadores e as limitações deverão constar do relatório.

## Critério de conclusão da Parte 2

Esta parte está concluída com:

- fundamentos e limites da WCAG 2.2 registrados;
- meta A/AA traduzida em 55 critérios rastreáveis;
- novos critérios da versão 2.2 identificados;
- critérios relacionados às jornadas e aos componentes do produto;
- métodos e estados de avaliação definidos para as próximas semanas;
- referências normativas e materiais de apoio documentados.

## Referências

- W3C. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/). Referência normativa.
- W3C WAI. [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/). Material explicativo não normativo.
- W3C WAI. [How to Meet WCAG 2.2 — Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/). Técnicas e falhas filtráveis.
- W3C WAI. [Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/). Visão geral dos métodos de avaliação.
- W3C WAI. [Conformance Evaluation and Reports](https://www.w3.org/WAI/test-evaluate/conformance/). Orientação para escopo, amostragem, avaliação e relatório.
- W3C WAI. [Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/). Combinação entre avaliação com usuários e avaliação por padrões.

Fontes consultadas em 30 de agosto de 2026.
