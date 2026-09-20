# Semana 4 — matriz de ferramentas de acessibilidade

## Critérios de seleção

As ferramentas foram escolhidas por cobertura complementar, execução local, compatibilidade com a stack, possibilidade de reproduzir resultados e custo adequado ao projeto acadêmico. Nenhuma ferramenta é tratada como prova isolada de acessibilidade.

## Matriz selecionada

| Ferramenta / recurso | Papel | Cobertura principal | Saída esperada | Limite conhecido | Decisão e momento |
| --- | --- | --- | --- | --- | --- |
| ESLint, TypeScript e build do Vite | integridade estática | erros de código, tipos e empacotamento | saída dos comandos e código de retorno | não avaliam experiência acessível | manter em todo commit |
| roteiro CDP da Semana 2 | diagnóstico reproduzível atual | rotas, foco, árvore AX, overflow e `forced-colors` | log textual/JSON controlado | não substitui interação humana nem leitor de tela | manter para comparação da linha de base |
| Playwright | orquestração futura de navegador | F01–F06, rotas, estados autenticados, teclado e sobreposições | teste repetível, trace/captura quando necessário | simulação de tecla não julga ordem lógica ou qualidade do anúncio | adotar na Semana 11 se a automação justificar a nova dependência |
| `@axe-core/playwright` / axe-core | regras automáticas | HTML/ARIA, nomes, relações, contraste detectável e regras WCAG A/AA | violações, passes e itens incompletos por estado | cobre apenas parte das barreiras e exige revisão manual | integrar aos cenários representativos na Semana 11 |
| Lighthouse | auditoria complementar | subconjunto automatizável e regressão geral por página | relatório e auditorias individuais | pontuação agregada não demonstra conformidade | usar na linha de base comparativa e avaliação final |
| Chrome/Edge DevTools | inspeção diagnóstica | árvore AX, nome/função/estado, ordem do DOM, estilos e contraste | observação registrada e capturas pontuais | árvore AX não reproduz a fala nem a interação do NVDA | usar durante diagnóstico e correção |
| teclado físico | operação sem ponteiro | ordem, acionamento, foco visível, armadilhas, menus e diálogos | roteiro com sequência e bloqueios | não avalia sozinho a saída para leitor de tela | obrigatório por item e fluxo afetado |
| NVDA + Chrome/Edge | tecnologia assistiva | landmarks, títulos, formulários, estados, mensagens, modo navegação/foco | notas de leitura e bloqueios por passo | depende de sessão em primeiro plano e combinação específica | reteste direcionado e execução completa na Semana 13 |
| Device Toolbar + zoom real | apresentação adaptável | 320 CSS px, 200%/400%, orientação, conteúdo longo | medidas e inspeção visual | largura equivalente não reproduz todos os efeitos do zoom real | usar nos itens de layout e em VAL-002 |
| tema de contraste do Windows + `forced-colors` | cores do sistema | foco, bordas, campos, estados e informação não baseada em cor | checklist visual antes/depois | emulação não substitui tema real | emulação no desenvolvimento; tema real em VAL-002 |
| DevTools e cálculo de luminância | contraste | texto, componente, foco e estados nos fundos reais | hexadecimais e razão calculada | amostragem incorreta de cor/fundo distorce o resultado | obrigatório para A11Y-004 e A11Y-008 |
| inspeção humana dos critérios | síntese e decisão | critérios não automatizáveis, contexto, clareza e equivalência | conclusão Atende/Não/NA/PV justificada | depende de método e experiência do avaliador | obrigatória em todo encerramento |

## Cobertura por requisito

Legenda: **P** = principal; **A** = apoio; **—** = não é fonte adequada para conclusão.

| Requisito | Código | axe / Lighthouse | DevTools | Teclado | NVDA | Visual / zoom / contraste |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| landmarks, títulos e estrutura | A | P | P | A | P | — |
| nome, função, valor e estado | A | P | P | A | P | A |
| ordem e gerenciamento de foco | A | A | A | P | P | P |
| diálogo e menu | A | A | P | P | P | A |
| rótulos, instruções e erros | A | A | P | P | P | A |
| mensagens dinâmicas | A | A | P | A | P | A |
| contraste e uso de cor | A | A | P | A | A | P |
| zoom, reflow e espaçamento | A | A | A | A | A | P |
| conclusão da jornada | — | — | — | P | P | A |

## Configuração planejada da automação

Quando a automação for incorporada na Semana 11:

- fixar as versões no `package-lock.json`;
- usar navegador Chromium compatível com o ambiente existente;
- autenticar por interface ou preparação controlada, sem gravar token no repositório;
- executar axe com tags WCAG 2.2 A/AA em T01–T09 e nos estados de diálogo/menu abertos;
- falhar o teste para violações novas e guardar `incomplete` para revisão humana;
- não desabilitar regra globalmente; exceção precisa de justificativa por nó, critério e data;
- gerar artefatos somente quando ajudarem a reproduzir a falha e remover dados sensíveis;
- manter comandos de lint, build e testes existentes como portas independentes.

A adoção de Playwright é deliberadamente adiada: a Semana 4 seleciona a abordagem, enquanto a Semana 11 prevê incorporar verificações automatizadas. Até lá, o roteiro CDP existente preserva a comparação com a linha de base sem aumentar dependências.

## Ferramentas não adotadas

| Categoria | Motivo |
| --- | --- |
| widget ou overlay de acessibilidade | não corrige a semântica e o comportamento do produto na origem nem comprova atendimento WCAG |
| pontuação automática como meta única | agrega um subconjunto de regras e pode ocultar barreiras críticas manuais |
| snapshot isolado do DOM | não demonstra foco, comportamento, anúncio, contraste percebido ou conclusão de tarefa |
| múltiplos motores automáticos redundantes | aumentam manutenção sem substituir o teste humano; novos motores exigem ganho de cobertura demonstrado |
| teste NVDA em janela sem primeiro plano | a Semana 2 mostrou que o resultado pode pertencer a outro processo e ser inconclusivo |

## Matriz de execução mínima

| Marco | Execuções obrigatórias |
| --- | --- |
| antes de corrigir | reproduzir na revisão-base; registrar código, teclado/visual pertinente e automação disponível |
| em cada commit de correção | lint, build, testes existentes, caso funcional e protocolo manual diretamente afetado |
| ao encerrar lote | fluxos relacionados, todas as instâncias compartilhadas, axe nos estados representativos e regressão mínima |
| Semana 11 | cenários automatizados representativos, axe e Lighthouse com revisão dos itens incompletos |
| Semana 13 | F01–F06 com NVDA, teclado, zoom real, espaçamento e tema real de contraste |
| avaliação final | comparação com a revisão `88eddc8`, backlog residual e limites explícitos |

## Referências

- [axe-core — Deque Systems](https://github.com/dequelabs/axe-core)
- [Accessibility testing — Playwright](https://playwright.dev/docs/accessibility-testing)
- [Lighthouse accessibility scoring — Chrome for Developers](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Accessibility features reference — Chrome for Developers](https://developer.chrome.com/docs/devtools/accessibility/reference)
- [eMAG 3.1 — Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf)
- [Guia do Usuário do NVDA — NV Access](https://download.nvaccess.org/documentation/pt_BR/userGuide.html)

Referências verificadas em 19/09/2026.
