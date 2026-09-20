# Semana 4 — plano técnico de acessibilidade

## Identificação

| Item | Definição |
| --- | --- |
| Período | 14/09/2026 a 20/09/2026 |
| Linha de base | revisão `88eddc8` da branch `main` |
| Produto | LendoJuntos web responsivo (React, TypeScript e FastAPI) |
| Meta | reduzir as barreiras dos fluxos centrais com referência na WCAG 2.2 A/AA e no eMAG 3.1 |
| Amostra fixa | T01–T09, C01–C10 e F01–F06 do inventário da Semana 2 |
| Entradas | [relatório inicial](semana-03-relatorio-inicial-auditoria.md) e [backlog priorizado](semana-03-backlog-priorizado-acessibilidade.md) |
| Entregas | este plano, a [metodologia de testes](semana-04-metodologia-testes-acessibilidade.md) e a [matriz de ferramentas](semana-04-matriz-ferramentas-acessibilidade.md) |

## Objetivo

Definir como os 14 achados e as duas validações da linha de base serão implementados, verificados e documentados. O plano torna repetível o ciclo entre diagnóstico e reteste, preserva a comparação antes/depois e impede que uma aprovação automática seja confundida com conformidade integral.

Não fazem parte da Semana 4 a correção do código de produção, a criação dos wireframes e do protótipo visual, a execução conclusiva com NVDA ou a declaração formal de conformidade. Essas atividades permanecem nas semanas previstas no cronograma.

## Padrões e ordem de decisão

| Ordem | Referência adotada | Uso no projeto |
| :---: | --- | --- |
| 1 | WCAG 2.2, níveis A e AA | fonte normativa dos critérios de sucesso e principal base dos critérios de aceite |
| 2 | HTML e WAI-ARIA | semântica, nomes, funções, valores, estados e propriedades expostos às tecnologias assistivas |
| 3 | WAI-ARIA Authoring Practices Guide (APG) | comportamento esperado de padrões compostos, principalmente diálogo modal, disclosure e botões de alternância |
| 4 | eMAG 3.1 | contextualização brasileira e recomendações complementares de marcação, comportamento, conteúdo, apresentação e formulários |
| 5 | WCAG-EM 2.0 | organização da avaliação: escopo, exploração, amostra, avaliação e relato dos resultados |

Regras de aplicação:

- preferir elementos HTML nativos; ARIA só complementa uma lacuna semântica real;
- um exemplo do APG orienta o comportamento, mas não substitui a verificação dos critérios WCAG aplicáveis;
- em caso de diferença, prevalece a exigência normativa da WCAG 2.2 para a meta A/AA;
- não atribuir conformidade a uma tela com base apenas em axe, Lighthouse, árvore de acessibilidade ou inspeção de código;
- manter o eMAG como referência complementar, sem convertê-lo artificialmente em níveis A/AA.

## Estratégia de verificação em camadas

| Camada | Pergunta respondida | Técnica | Momento |
| --- | --- | --- | --- |
| 1. Código | a implementação usa estrutura e atributos coerentes? | revisão de React/HTML/CSS, lint, TypeScript e build | em cada alteração |
| 2. Navegador automatizado | regressões detectáveis por regra reapareceram? | cenários de navegador e axe-core em páginas e estados representativos | durante a correção e na Semana 11 |
| 3. Navegador manual | a interface é operável e perceptível nos estados reais? | teclado, foco, zoom, reflow, espaçamento, contraste e cores forçadas | em cada item afetado |
| 4. Tecnologia assistiva | nomes, relações, estados e mensagens são compreensíveis no uso? | NVDA com navegador em primeiro plano e árvore de acessibilidade como apoio diagnóstico | retestes locais e validação da Semana 13 |
| 5. Jornada | a pessoa conclui a tarefa sem barreira ou perda de dados? | execução ponta a ponta de F01–F06 | ao encerrar cada lote e na avaliação final |

As camadas são cumulativas. Uma regra automática aprovada não dispensa o teste manual; a árvore de acessibilidade não substitui o NVDA; e o NVDA não substitui a verificação visual de foco, contraste e reflow.

## Ambiente controlado

Cada evidência deverá registrar as versões efetivamente usadas. O ambiente mínimo planejado é:

- stack Docker local, banco de demonstração reinicializável e `ENABLE_SEED_DATA=true`;
- frontend em `http://localhost:4173` e API em `http://localhost:8000`;
- Windows, Chrome ou Edge baseado em Chromium e NVDA em português do Brasil;
- conta de demonstração documentada no README, sem expor senha em capturas ou relatórios;
- larguras úteis de 1280, 640 e 320 CSS px, além de zoom real de 200% e 400% quando aplicável;
- tema padrão e ao menos um tema real de contraste do Windows;
- estados padrão, carregando, vazio, erro, sucesso, desabilitado, menu aberto e diálogo aberto quando existirem.

Dados criados durante o teste devem usar prefixo `A11Y-TESTE` e ser removidos ou recriados de forma controlada. O hash do commit, a data, o navegador, o sistema, a tecnologia assistiva e as configurações não padrão fazem parte do registro.

## Plano de implementação por lote

| Lote | Semanas | Itens | Dependência técnica | Porta de saída |
| --- | :---: | --- | --- | --- |
| Fundações | 7 | A11Y-004, A11Y-005, A11Y-002, A11Y-008 | tokens globais, layout e roteamento | foco global medido, link de salto funcional, título/foco por rota e contraste registrado |
| Sobreposições | 8 | A11Y-001, A11Y-012, A11Y-013 | fundações de foco | oito diálogos e dois menus passam nos roteiros de teclado e semântica |
| Formulários e feedback | 9–11 | A11Y-003, A11Y-009, A11Y-011, A11Y-014 | contexto de rota e regiões de anúncio | erros associados, finalidade dos campos, anúncios únicos e prevenção de erro verificadas |
| Conteúdo e interação | 9–10 | A11Y-006, A11Y-010, A11Y-007 | foco global e semântica nativa | cartões, alternâncias e autenticação passam em teclado, estados e reflow |
| Automação representativa | 11 | regressões dos lotes anteriores | estados estáveis no navegador | cenários axe/Lighthouse documentados, com itens incompletos revisados manualmente |
| Validação final | 13 | VAL-001 e VAL-002 | P0 e P1 corrigidos | F01–F06 executados com NVDA, zoom, espaçamento e contraste real; pendências abertas |

Uma dependência pode antecipar trabalho, mas não autoriza encerrar um item sem todos os critérios de aceite do backlog e da metodologia.

## Rastreabilidade e evidências

Cada achado mantém seu ID original. O registro de reteste deverá conter:

1. ID e critério WCAG/eMAG relacionado;
2. revisão antes e revisão corrigida;
3. tela, componente, estado e fluxo;
4. passos reproduzíveis e resultado esperado;
5. resultado observado antes e depois;
6. ferramenta e ambiente com versão;
7. evidência textual e, quando útil, captura ou relatório;
8. conclusão `Atende`, `Não atende`, `Não aplicável` ou `Pendente de validação`;
9. limitações e novo ID, se surgir uma barreira diferente.

Convenção para futuros arquivos de evidência: `docs/evidencias-acessibilidade/<ID>/<AAAA-MM-DD>-<tipo>-<descricao>.<ext>`. Relatórios gerados não devem conter token, senha, e-mail pessoal ou dados não destinados ao repositório.

## Critérios globais de entrada e saída

### Entrada de um item em correção

- barreira reproduzida na revisão informada;
- alcance, critério relacionado e severidade confirmados;
- critério de aceite específico compreendido;
- estados e fluxos de regressão identificados;
- dependências anteriores concluídas ou explicitamente tratadas.

### Saída de um item como concluído

- todos os critérios de aceite específicos têm evidência;
- lint, build e testes existentes terminam sem erro;
- fluxo afetado é operável por teclado e não apresenta regressão funcional;
- verificação automática pertinente foi executada e resultados `incomplete` foram revisados;
- verificação manual pertinente foi executada no ambiente definido;
- comparação antes/depois e hash das revisões foram registrados;
- critérios WCAG/eMAG foram reavaliados sem extrapolar a amostra;
- limitações restantes estão no backlog, e não apenas em comentário informal.

## Riscos e controles

| Risco | Controle adotado |
| --- | --- |
| aprovação automática virar alegação de conformidade | sempre combinar automação com inspeção humana e declarar o recorte |
| falso encerramento por testar só o caminho feliz | testar estados de erro, carregamento, vazio, sobreposição e conteúdo longo |
| correção local quebrar componente compartilhado | enumerar todas as instâncias e executar o roteiro em cada variação |
| diferença entre DOM e experiência com leitor de tela | validar com NVDA em sessão dedicada; usar árvore AX apenas para diagnóstico |
| evidência não reproduzível | registrar commit, ambiente, dados, passos e resultado observado |
| mudança de ferramenta alterar resultados | fixar dependências no lockfile e registrar versão nos relatórios |
| dados sensíveis em artefatos | usar dados sintéticos e revisar capturas/JSON antes do commit |

## Critério de conclusão da Semana 4

A Semana 4 está concluída quando este plano:

- seleciona e hierarquiza padrões e ferramentas;
- fixa amostra, ambiente, camadas e lotes de verificação;
- aponta para os seis fluxos e para critérios de aceite reproduzíveis;
- define entradas, saídas, evidências e limites das conclusões;
- mantém rastreabilidade integral com os IDs da Semana 3;
- é acompanhado pela metodologia e pela matriz de ferramentas.

## Referências

- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [WCAG-EM 2.0 — W3C](https://www.w3.org/TR/WCAG-EM/)
- [WAI-ARIA Authoring Practices Guide — W3C](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [eMAG 3.1 — Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/eMAGv31.pdf)
- [Accessibility features reference — Chrome for Developers](https://developer.chrome.com/docs/devtools/accessibility/reference)
- [axe-core — Deque Systems](https://github.com/dequelabs/axe-core)

Referências verificadas em 19/09/2026.
