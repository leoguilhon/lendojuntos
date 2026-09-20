# Semana 4 — metodologia de testes de acessibilidade

## Finalidade

Esta metodologia operacionaliza o [plano técnico](semana-04-plano-tecnico-acessibilidade.md) e transforma o [backlog da Semana 3](semana-03-backlog-priorizado-acessibilidade.md) em testes repetíveis. Ela será aplicada durante a implementação e no reteste dos 14 achados, sem substituir testes com pessoas nem sustentar, sozinha, uma declaração de conformidade.

## Unidade de teste e estados de resultado

A unidade mínima é a combinação `achado + tela/componente + estado + fluxo + ambiente`. Um mesmo achado só é encerrado quando todas as combinações declaradas em sua abrangência forem avaliadas.

| Estado | Uso |
| --- | --- |
| Atende | o resultado observado satisfaz integralmente o critério de aceite no recorte testado |
| Não atende | há evidência reproduzível de falha total ou parcial |
| Não aplicável | o conteúdo ou comportamento necessário ao critério não existe no recorte; exige justificativa |
| Pendente de validação | o método ou ambiente disponível não permite conclusão segura |
| Bloqueado | pré-condição técnica impediu o teste; não equivale a aprovação ou reprovação |

## Ciclo diagnosticar–corrigir–retestar

1. **Diagnosticar:** reproduzir na revisão-base, reduzir a causa, identificar alcance, critério, impacto e evidência anterior.
2. **Especificar:** selecionar o padrão nativo/ARIA aplicável, critérios de aceite, casos de regressão e ferramentas.
3. **Corrigir:** alterar o menor componente compartilhado capaz de resolver todo o alcance conhecido, sem adicionar ARIA redundante.
4. **Verificar localmente:** executar lint, build, teste funcional, teclado e checagem específica do critério.
5. **Retestar:** repetir os mesmos passos e dados da linha de base em uma revisão identificada; executar também estados adjacentes e fluxo completo.
6. **Comparar:** registrar antes/depois, ferramenta, ambiente, resultados automáticos e observação humana.
7. **Decidir:** concluir apenas se todas as condições passarem; caso contrário, reabrir o item ou criar achado relacionado.

Uma correção reprovada volta à etapa de diagnóstico. Um resultado automático `incomplete`, um ensaio NVDA inconclusivo ou uma variante não testada permanece pendente.

## Severidade e prioridade

Severidade mede o impacto da barreira; prioridade ordena o trabalho considerando também alcance, dependências e custo. Alterar uma não muda automaticamente a outra.

### Regra de severidade

| Severidade | Impacto observável | Alternativa | Exemplos do projeto |
| --- | --- | --- | --- |
| Crítica | impede ou desvia uma jornada essencial, gera perda relevante de contexto/dados ou torna conteúdo essencial indisponível | inexistente ou não confiável | foco fora de diálogo modal que bloqueia administração |
| Alta | causa dificuldade relevante, quebra critério A/AA ou afeta componente/fluxo recorrente | parcial, difícil ou dependente de ajuda | foco invisível, erro não associado, cartão com semântica ambígua |
| Média | falha localizada reduz compreensão, previsibilidade ou eficiência | contorno viável | menu que não fecha por `Escape`, ação antecipada em `mousedown` |
| Baixa | inconsistência ou refinamento com impacto limitado, sem impedir tarefa | simples e confiável | ajuste textual ou de consistência sem perda de informação |

Critérios de desempate, nesta ordem: impossibilidade de concluir tarefa; risco de dado; quantidade de fluxos; recorrência do componente; público que depende exclusivamente do recurso. A severidade só é reduzida com evidência de menor impacto, nunca apenas porque a correção é cara.

### Regra de prioridade

- `P0`: bloqueio crítico ou fundação transversal que destrava outras correções;
- `P1`: falha relevante a corrigir no ciclo principal antes da avaliação final;
- `P2`: falha localizada ou dependente das fundações, ainda obrigatória no backlog;
- `VAL`: investigação que pode confirmar, descartar ou originar um achado.

## Fluxos de teste

Pré-condições comuns: stack saudável, dados seed carregados, conta de demonstração disponível, console sem erro impeditivo e commit registrado. Toda ação descrita deve ser repetida primeiro por teclado; nos marcos de validação, também com NVDA.

| Fluxo | Roteiro resumido | Pontos de observação | Itens cobertos |
| --- | --- | --- | --- |
| F01 Criar conta, entrar e sair | abrir cadastro; preencher nome/e-mail/senha; provocar e corrigir erro; criar conta ou voltar; entrar; confirmar dashboard; sair | título e `h1`, foco pós-rota, rótulos, `autocomplete`, erro associado/anunciado, preservação de dados, reflow | A11Y-002, A11Y-003, A11Y-007, A11Y-009, A11Y-011 |
| F02 Localizar e ingressar em clube | entrar; percorrer dashboard; abrir clube disponível; ingressar; favoritar e desfavoritar | link de salto, ordem/foco, link nativo do cartão, ação separada, `aria-pressed` ou equivalente, anúncio único | A11Y-002–006, A11Y-008, A11Y-010 |
| F03 Consultar leitura e histórico | abrir clube; navegar para livros; abrir leitura; alternar situação quando permitido; curtir/descurtir; voltar ao histórico | estrutura de títulos, destino e nome dos links, estado atual, agrupamento, contraste, retorno de contexto | A11Y-002–006, A11Y-008, A11Y-010 |
| F04 Consultar encontro e confirmar presença | abrir encontros; acessar um encontro; confirmar e remover presença | cartão/link nativo, data e estado compreensíveis, anúncio da alteração, operação sem depender de cor | A11Y-002–006, A11Y-008, A11Y-010 |
| F05 Ler e publicar comentário | acessar livro e encontro; chegar à lista; enviar vazio/erro e texto válido; revisar ou desfazer conforme solução | rótulo, erro, região de status, foco, proteção contra envio indevido e persistência | A11Y-003, A11Y-009, A11Y-014 |
| F06 Administrar clube, livro e encontro | abrir cada menu; abrir diálogos de criar/editar/excluir; percorrer com `Tab`/`Shift+Tab`; cancelar por botão e `Escape`; concluir uma operação | nome/modalidade, foco inicial/contido/devolvido, fundo inerte, acionador do menu, fechamento externo cancelável, confirmação | A11Y-001, A11Y-003, A11Y-009, A11Y-012–014 |

Cada fluxo deve registrar resultado separado para suas telas, não apenas uma conclusão agregada.

## Protocolos por modo de acesso

### Somente teclado

1. Recarregar a rota e não usar mouse durante o caso.
2. Usar `Tab` e `Shift+Tab` para percorrer todos os controles na ordem visual/lógica.
3. Acionar links e botões com as teclas nativas (`Enter` e, para botão, `Espaço`).
4. Verificar indicador de foco em todos os fundos e que nenhum elemento esteja oculto ou obscurecido.
5. Em sobreposições, repetir primeiro/último foco, `Escape`, Cancelar, Fechar e retorno ao acionador.
6. Confirmar que não existe armadilha e que controles inativos não entram na ordem de foco.
7. Registrar sequência, bloqueio, salto inesperado e elemento que recebe foco após cada mudança de contexto.

### NVDA e navegador

1. Iniciar o NVDA antes do navegador e confirmar que a página está em primeiro plano.
2. Registrar versão, navegador, sintetizador, idioma e modo navegação/foco.
3. Explorar título, landmarks, títulos, links, botões e campos com navegação rápida e lista de elementos.
4. Executar F01–F06 ouvindo nomes, funções, estados, instruções, erros e mensagens dinâmicas.
5. Conferir mudança de rota, diálogo, menu, alternâncias e retorno de foco.
6. Parafrasear a fala relevante; não usar a árvore AX como substituta do resultado.
7. Se o foco mudar para outro processo, marcar o passo como pendente e repetir em sessão dedicada.

### Zoom, reflow e espaçamento

- testar 1280, 640 e 320 CSS px, orientação retrato/paisagem e zoom real de 200% e 400%;
- comparar `scrollWidth` e `clientWidth`, mas também verificar corte, sobreposição, truncamento e operação;
- abrir diálogos e menus, usar textos longos e observar cabeçalhos, cartões, formulários e botões;
- aplicar os valores de espaçamento do critério 1.4.12 e verificar perda de conteúdo/função;
- aceitar rolagem bidimensional apenas nas exceções previstas pelo critério 1.4.10.

### Contraste, cor e movimento

- medir texto e componentes no estado e no fundo reais, incluindo foco, hover, ativo e desabilitado;
- exigir ao menos 4,5:1 para texto comum, 3:1 para texto grande quando aplicável e 3:1 para componentes/indicadores conforme o critério pertinente;
- validar que estado, erro e seleção não dependem somente da cor;
- repetir com `forced-colors` e com tema real de contraste do Windows;
- ativar redução de movimento e verificar que não há transição indispensável à compreensão.

### Verificação automática

- executar axe-core em cada tela e novamente com menus, diálogos e estados dinâmicos visíveis;
- filtrar regras WCAG 2.2 A/AA, guardar violações e revisar manualmente resultados incompletos;
- usar Lighthouse como verificação complementar e registrar auditorias individuais, não apenas a nota;
- comparar pela identificação da regra e pelos nós afetados, pois a pontuação não é critério de aceite;
- não ignorar uma regra sem justificativa, vínculo com critério e revisão humana.

## Critérios de aceite transversais

Um caso passa somente quando:

- a tarefa é concluída por teclado, com ordem e foco perceptíveis;
- nomes, funções, valores e estados expostos correspondem ao texto e ao comportamento visual;
- atualizações relevantes são anunciadas uma vez, na prioridade adequada, sem mudança de foco indevida;
- erro identifica campo e problema, sugere correção quando conhecida e preserva entrada válida;
- 320 CSS px e as condições de zoom aplicáveis não causam perda de conteúdo ou operação;
- cor, contraste e movimento satisfazem os critérios aplicáveis em todos os estados declarados;
- não há nova violação automática pertinente e todo resultado incompleto foi analisado;
- o comportamento funcional original permanece correto;
- evidência identifica revisão, ambiente, passos e conclusão.

Para componentes compartilhados, todas as instâncias inventariadas devem passar. Para um fluxo, todos os passos essenciais devem passar; média, nota ou sucesso parcial não compensam uma falha.

## Regressão mínima por alteração

| Área alterada | Reteste obrigatório |
| --- | --- |
| layout, tokens ou roteamento global | T01–T09; link de salto; título; foco; 320 CSS px; contraste/cores forçadas |
| `Modal` | oito diálogos; abertura, ciclo, `Escape`, Cancelar, Fechar, concluir, clique no fundo e retorno |
| `ActionMenu` | menu de clube e de encontro; teclado, estado aberto/fechado, clique externo e retorno |
| formulário ou feedback | sucesso, erro de cliente, erro de servidor, carregando, reenvio e preservação de entrada |
| cartão ou alternância | clube, livro e encontro afetados; Enter/Espaço; ação secundária; estado antes/depois |

## Modelo de registro de execução

```md
### <ID> — <caso>

- Revisão antes / depois:
- Data, executor e ambiente:
- Tela, estado e fluxo:
- Critérios WCAG/eMAG:
- Pré-condições:
- Passos:
- Esperado:
- Observado antes:
- Observado depois:
- Automação (violation/incomplete/pass):
- Resultado: Atende | Não atende | NA | PV | Bloqueado
- Evidências:
- Limitações / novo achado:
```

## Triagem e encerramento

- falha que reproduz o achado mantém o mesmo ID;
- falha com causa, critério ou alcance diferente recebe novo ID e vínculo `relacionado a`;
- regressão funcional causada pela correção impede o encerramento, mesmo sem nova falha WCAG;
- comportamento divergente entre navegador e NVDA fica pendente até análise no ambiente suportado;
- somente evidência posterior ao commit da correção vale como reteste;
- a conclusão se limita à amostra e ao ambiente registrados.

## Referências

- [WCAG-EM 2.0 — W3C](https://www.w3.org/TR/WCAG-EM/)
- [Easy Checks — W3C WAI](https://www.w3.org/WAI/test-evaluate/preliminary/)
- [Dialog (Modal) Pattern — WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Guia do Usuário do NVDA — NV Access](https://download.nvaccess.org/documentation/pt_BR/userGuide.html)
- [Accessibility features reference — Chrome for Developers](https://developer.chrome.com/docs/devtools/accessibility/reference)
- [axe-core API — Deque Systems](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)

Referências verificadas em 19/09/2026.
