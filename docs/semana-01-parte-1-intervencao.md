# Semana 1 — Parte 1: continuidade da intervenção

## Divisão da semana

A primeira semana foi organizada em duas partes para separar as decisões de produto do estudo técnico que orientará a avaliação da interface:

| Parte | Entrega | Situação |
| --- | --- | --- |
| 1 | Alinhamento da continuidade do LendoJuntos como intervenção; delimitação do público, das barreiras e do impacto social | Concluída neste documento |
| 2 | Estudo de acessibilidade digital e da WCAG 2.2 nos níveis A e AA | Pendente |

## Decisão de continuidade

O LendoJuntos continuará como uma intervenção sociotécnica voltada à participação em clubes de leitura. A nova etapa não substitui o produto já desenvolvido: ela parte do MVP existente e busca reduzir barreiras que possam impedir ou dificultar o acesso, a compreensão e a participação autônoma de pessoas com diferentes necessidades.

A intervenção combina:

- o sistema web, no qual as pessoas organizam clubes, livros, encontros e comentários;
- a revisão das jornadas e dos componentes da interface sob a perspectiva da acessibilidade;
- a participação de usuários na identificação, priorização e validação das melhorias;
- o registro de critérios e evidências para que a acessibilidade permaneça no processo de desenvolvimento.

O recorte inicial será a experiência web responsiva já existente. Não fazem parte desta etapa a criação de aplicativo nativo, a digitalização ou distribuição de livros, a disponibilização de audiolivros e a substituição de tecnologias assistivas. Integrações desse tipo poderão ser avaliadas posteriormente.

## Problema de intervenção

Clubes de leitura podem depender de mensagens espalhadas, planilhas e redes sociais genéricas para organizar suas atividades. O LendoJuntos concentra essas tarefas, mas a simples disponibilidade de um sistema não garante participação inclusiva. Barreiras de percepção, operação, compreensão e compatibilidade podem reproduzir exclusões no ambiente digital.

Assim, o problema que orienta esta etapa é:

> Como tornar as jornadas essenciais do LendoJuntos mais acessíveis e compreensíveis para que mais pessoas possam participar de clubes de leitura com autonomia?

## Público delimitado

### Público direto

Participantes e organizadores de clubes de leitura comunitários, educacionais ou informais que utilizem celular ou computador para acompanhar leituras, encontros e discussões.

Dentro desse grupo, a intervenção prioriza pessoas que encontrem barreiras no uso de interfaces digitais, incluindo:

- pessoas cegas ou com baixa visão;
- pessoas surdas ou com perda auditiva, quando houver conteúdo multimídia;
- pessoas com limitações motoras permanentes, temporárias ou situacionais;
- pessoas com deficiência cognitiva, dificuldades de leitura ou atenção;
- pessoas idosas ou com pouca familiaridade digital.

### Público indireto

- mediadores, professores, bibliotecários e administradores de clubes;
- instituições que promovem leitura e inclusão;
- equipe responsável pela evolução e manutenção do LendoJuntos.

### Personas provisórias para orientar a análise

As personas abaixo são hipóteses de trabalho, não resultados de pesquisa com usuários:

1. **Participante que usa leitor de tela:** precisa navegar, identificar controles, preencher formulários e compreender mensagens sem depender da apresentação visual.
2. **Participante com baixa visão:** precisa ampliar a página e distinguir textos, estados e controles sem perda de conteúdo ou funcionalidade.
3. **Participante que utiliza apenas teclado:** precisa alcançar e acionar todas as funções com foco visível e ordem de navegação coerente.
4. **Participante com pouca familiaridade digital:** precisa de linguagem direta, instruções claras, prevenção de erros e confirmação das ações realizadas.
5. **Organizador de clube:** precisa publicar livros e encontros de modo acessível para não criar novas barreiras aos demais participantes.

Essas hipóteses deverão ser revisadas após contato com usuários reais ou representantes do público.

## Barreiras iniciais a investigar

Esta lista é um diagnóstico preliminar. A existência e a gravidade de cada barreira deverão ser confirmadas por inspeção do produto e testes com usuários.

| Dimensão | Barreiras possíveis | Jornadas afetadas |
| --- | --- | --- |
| Percepção | contraste insuficiente; informação transmitida apenas por cor; imagens sem alternativa textual; hierarquia visual pouco clara | login, dashboard, consulta de livros e encontros |
| Operação | foco invisível; ordem de tabulação incoerente; controles inacessíveis por teclado; áreas de acionamento pequenas | menus, modais, formulários e confirmação de presença |
| Compreensão | rótulos vagos; mensagens de erro pouco explicativas; instruções ausentes; datas e estados ambíguos | cadastro, criação e edição de clubes, livros e encontros |
| Compatibilidade | semântica inadequada; nome, função ou estado não expostos; atualizações dinâmicas não anunciadas | navegação com leitor de tela e uso de tecnologias assistivas |
| Contexto de uso | tela pequena; ampliação; conexão instável; fadiga ou atenção dividida | todas as jornadas em dispositivos móveis |
| Organização social | moderadores sem orientação para produzir conteúdo acessível; ausência de canal de feedback | publicação de conteúdo e evolução contínua do produto |

As jornadas essenciais que terão prioridade na avaliação são:

1. criar conta, entrar e recuperar-se de erros de autenticação;
2. localizar um clube e compreender suas informações;
3. consultar o livro atual e o histórico de leituras;
4. consultar um encontro e confirmar presença;
5. publicar e ler comentários;
6. para organizadores, cadastrar ou editar clubes, livros e encontros.

## Impacto social pretendido

O impacto de longo prazo pretendido é ampliar a participação autônoma e equitativa em comunidades de leitura mediadas pelo LendoJuntos. No horizonte desta etapa, o resultado esperado é mais específico: identificar e reduzir barreiras nas jornadas essenciais e incorporar acessibilidade ao processo de evolução do sistema.

### Teoria de mudança resumida

Se a equipe ouvir o público priorizado, avaliar as jornadas essenciais, corrigir barreiras e registrar critérios verificáveis, então mais participantes conseguirão perceber, compreender e operar o LendoJuntos com autonomia. Isso tende a reduzir a dependência de terceiros e a favorecer permanência, interação e pertencimento nos clubes de leitura.

### Resultados e indicadores

| Horizonte | Resultado esperado | Evidência ou indicador |
| --- | --- | --- |
| Curto prazo | barreiras conhecidas e priorizadas | inventário de barreiras com jornada, severidade e público afetado |
| Curto prazo | equipe orientada por requisitos verificáveis | checklist de acessibilidade associado às funcionalidades avaliadas |
| Médio prazo | jornadas essenciais com menos impedimentos | proporção de problemas críticos e altos corrigidos e reavaliados |
| Médio prazo | maior autonomia no uso | taxa de conclusão das tarefas e quantidade de ajuda necessária nos testes |
| Médio prazo | experiência mais compreensível | erros por tarefa e percepção dos participantes sobre clareza e esforço |
| Longo prazo | participação digital mais inclusiva | relatos de participação, retenção e satisfação, segmentados quando houver amostra e consentimento adequados |

Não será atribuída causalidade ao projeto apenas com métricas de acesso. Números de usuários, clubes ou comentários podem indicar alcance, mas precisam ser combinados com evidências de acessibilidade e relatos do público para sustentar conclusões sobre inclusão.

## Princípios para a próxima etapa

- **Participação:** validar hipóteses com pessoas afetadas pelas barreiras sempre que possível.
- **Nada sobre o usuário sem contexto:** registrar necessidade, jornada e impacto antes de propor uma solução.
- **Acessibilidade desde o planejamento:** usar os critérios técnicos como requisitos e critérios de aceite, não apenas como verificação final.
- **Compatibilidade:** considerar diferentes dispositivos, ampliação, teclado e tecnologias assistivas.
- **Privacidade e respeito:** coletar somente dados necessários, explicar a finalidade e evitar expor condições de saúde ou deficiência.
- **Evolução mensurável:** documentar a situação inicial, a mudança realizada e a reavaliação.

## Critério de conclusão da Parte 1

Esta parte é considerada concluída com:

- decisão e escopo da continuidade registrados;
- público direto, indireto e grupos priorizados delimitados;
- hipóteses de barreiras relacionadas às jornadas do produto;
- impacto social traduzido em resultados e indicadores iniciais;
- limites, premissas e pontos que ainda exigem validação identificados.

A Parte 2 deverá transformar o estudo de acessibilidade digital e WCAG 2.2 A/AA em um referencial aplicável ao LendoJuntos, preservando a distinção entre conformidade técnica, usabilidade e impacto social.
