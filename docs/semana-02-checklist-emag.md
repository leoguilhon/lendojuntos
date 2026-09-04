# Semana 2 — checklist eMAG 3.1 aplicado ao LendoJuntos

## Objetivo e uso

Este checklist traduz as 45 recomendações técnicas do eMAG 3.1 para o contexto do frontend React do LendoJuntos. Ele é um instrumento de preparação: a coluna de aplicabilidade delimita o que deve entrar na auditoria da linha de base da Semana 3, mas não declara conformidade.

O eMAG foi elaborado para sítios e portais do governo brasileiro e se baseia na WCAG 2.0. O LendoJuntos não é um portal governamental e tem como meta técnica a WCAG 2.2 A/AA; por isso, o modelo brasileiro é usado como referência complementar, especialmente para avaliação manual, linguagem, formulários e necessidades locais. A [matriz WCAG da Semana 1](semana-01-parte-2-wcag.md) continua sendo a referência normativa principal do projeto.

Legenda de aplicabilidade:

- **Aplicável:** existe conteúdo ou interação correspondente no MVP e o item deve ser verificado.
- **Condicional:** deve ser verificado se o conteúdo ou comportamento indicado estiver presente.
- **N/A atual:** o recurso não existe no MVP; a decisão deve ser revista se o escopo mudar.

## 1. Marcação

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 1.1 | Respeitar os Padrões Web | Aplicável | Validar HTML gerado, nomes, funções e estados; registrar erros de marcação que afetem navegadores ou tecnologias assistivas. |
| 1.2 | Organizar o código HTML de forma lógica e semântica | Aplicável | Conferir uso de `header`, `nav`, `main`, títulos, listas, formulários, botões e links; evitar semântica simulada quando houver elemento nativo. |
| 1.3 | Utilizar corretamente os níveis de cabeçalho | Aplicável | Verificar um propósito claro para o `h1` e hierarquia sem saltos incoerentes em cada uma das nove telas. |
| 1.4 | Ordenar de forma lógica e intuitiva a leitura e tabulação | Aplicável | Comparar ordem do DOM, leitura sem CSS e sequência de `Tab`; não usar `tabindex` positivo. |
| 1.5 | Fornecer âncoras para ir direto a um bloco de conteúdo | Aplicável | Verificar link de salto para o conteúdo principal nas páginas autenticadas, que repetem cabeçalho e navegação. |
| 1.6 | Não utilizar tabelas para diagramação | N/A atual | Confirmar que nenhuma tabela seja introduzida apenas para layout; tabelas futuras devem representar dados tabulares. |
| 1.7 | Separar links adjacentes | Aplicável | Conferir se links próximos têm texto e separação perceptíveis em cabeçalho, ações e cartões. |
| 1.8 | Dividir as áreas de informação | Aplicável | Conferir landmarks e regiões com nomes quando houver mais de uma região do mesmo tipo. |
| 1.9 | Não abrir novas instâncias sem a solicitação do usuário | Aplicável | Confirmar que links e ações não abram aba ou janela inesperadamente e que qualquer exceção seja informada. |

## 2. Comportamento (DOM)

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 2.1 | Disponibilizar todas as funções da página via teclado | Aplicável | Executar autenticação, clubes, livros, encontros, comentários, perfil, menus e modais sem mouse. |
| 2.2 | Garantir que os objetos programáveis sejam acessíveis | Aplicável | Verificar nome, função, valor, estado e operação de cartões clicáveis, menu de ações, botões de estado e diálogos. |
| 2.3 | Não criar páginas com atualização automática periódica | N/A atual | O MVP não atualiza páginas periodicamente; reavaliar se polling ou atualização em tempo real for adicionado. |
| 2.4 | Não utilizar redirecionamento automático de páginas | N/A atual | Mudanças atuais decorrem de autenticação ou ação solicitada; reavaliar qualquer redirecionamento temporizado. |
| 2.5 | Fornecer alternativa para modificar limite de tempo | Condicional | Avaliar expiração da sessão e qualquer limite futuro; avisar, permitir extensão quando possível e preservar dados. |
| 2.6 | Não incluir situações com intermitência de tela | Aplicável | Confirmar ausência de conteúdo com flashes e manter esse requisito para mídia ou feedback futuro. |
| 2.7 | Assegurar o controle do usuário sobre alterações temporais do conteúdo | Aplicável | Verificar animações de entrada, rolagem suave e atualizações dinâmicas; respeitar `prefers-reduced-motion` e não retirar controle. |

## 3. Conteúdo e informação

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 3.1 | Identificar o idioma principal da página | Aplicável | Confirmar `lang="pt-BR"` no documento entregue e preservá-lo em todas as rotas. |
| 3.2 | Informar mudança de idioma no conteúdo | Condicional | Marcar trechos em outro idioma quando nomes ou conteúdo exigirem pronúncia específica; não marcar nomes próprios sem necessidade. |
| 3.3 | Oferecer um título descritivo e informativo à página | Aplicável | Atualizar e testar o título do documento por rota e por contexto, não apenas “LendoJuntos”. |
| 3.4 | Informar o usuário sobre sua localização na página | Aplicável | Conferir título principal, item atual da navegação e mecanismo de retorno; avaliar breadcrumb nos fluxos aninhados. |
| 3.5 | Descrever links clara e sucintamente | Aplicável | Ler os links fora de contexto e evitar instruções dependentes de “clique”, posição ou aparência. |
| 3.6 | Fornecer alternativa em texto para as imagens do sítio | Aplicável | Conferir os logotipos e futuras capas; imagens decorativas devem ter alternativa vazia. |
| 3.7 | Utilizar mapas de imagem de forma acessível | N/A atual | Não há mapas de imagem no MVP. |
| 3.8 | Disponibilizar documentos em formatos acessíveis | Condicional | Se clubes anexarem documentos, oferecer formato acessível, identificação de tipo/tamanho e alternativa em HTML quando necessária. |
| 3.9 | Em tabelas, utilizar títulos e resumos de forma apropriada | N/A atual | Não há tabelas na interface do MVP; reavaliar relatórios ou agendas tabulares futuros. |
| 3.10 | Associar células de dados às células de cabeçalho | N/A atual | Aplicar `th` e associações adequadas se tabelas de dados forem introduzidas. |
| 3.11 | Garantir a leitura e compreensão das informações | Aplicável | Revisar português, instruções, datas, estados de leitura, presença, permissões, feedbacks e estados vazios com o público. |
| 3.12 | Disponibilizar uma explicação para siglas, abreviaturas e palavras incomuns | Condicional | Expandir termos técnicos ou pouco familiares quando aparecerem; linguagem interna não deve ser pressuposta. |

## 4. Apresentação e design

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 4.1 | Oferecer contraste mínimo entre plano de fundo e primeiro plano | Aplicável | Medir texto, ícones, bordas, estados, foco e conteúdo sobre transparências nos temas normal e de contraste. |
| 4.2 | Não utilizar apenas cor ou outras características sensoriais para diferenciar elementos | Aplicável | Confirmar rótulo textual ou estado programático para favorito, curtida, leitura, presença, erro e navegação atual. |
| 4.3 | Permitir redimensionamento sem perda de funcionalidade | Aplicável | Testar zoom/reflow até 400%, texto a 200% e viewport estreito, incluindo modais, menus, listas e strings longas. |
| 4.4 | Possibilitar que o elemento com foco seja visualmente evidente | Aplicável | Percorrer todos os controles, medir contraste do indicador e confirmar que cabeçalho fixo ou sobreposições não ocultem o foco. |

## 5. Multimídia

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 5.1 | Fornecer alternativa para vídeo | N/A atual | O MVP não publica vídeo; exigir alternativa equivalente se o recurso for adicionado. |
| 5.2 | Fornecer alternativa para áudio | N/A atual | O MVP não publica áudio; exigir transcrição ou alternativa equivalente no escopo futuro. |
| 5.3 | Oferecer audiodescrição para vídeo pré-gravado | N/A atual | Não há vídeo pré-gravado. |
| 5.4 | Fornecer controle de áudio para som | N/A atual | Não há som automático ou player de áudio. |
| 5.5 | Fornecer controle de animação | Condicional | As animações decorativas atuais param com preferência de movimento reduzido; reavaliar qualquer animação longa, automática ou informativa. |

## 6. Formulários

| ID | Recomendação do eMAG | Aplicabilidade | Verificação e evidência esperada no LendoJuntos |
| --- | --- | --- | --- |
| 6.1 | Fornecer alternativa em texto para os botões de imagem de formulários | N/A atual | Não há botão de formulário composto apenas por imagem; todo ícone acionável futuro precisa de nome acessível. |
| 6.2 | Associar etiquetas aos seus campos | Aplicável | Conferir nome acessível de todos os campos de login, cadastro, perfil, clube, livro, encontro e comentário. |
| 6.3 | Estabelecer uma ordem lógica de navegação | Aplicável | Comparar sequência de campos e ações com a ordem visual e a intenção da tarefa, inclusive dentro dos modais. |
| 6.4 | Não provocar automaticamente alteração no contexto | Aplicável | Foco, digitação ou seleção não devem navegar, enviar ou abrir conteúdo sem ação explícita. |
| 6.5 | Fornecer instruções para entrada de dados | Aplicável | Informar formato, obrigatoriedade, exemplos e restrições antes do erro; `placeholder` não substitui instrução persistente. |
| 6.6 | Identificar e descrever erros de entrada de dados e confirmar o envio das informações | Aplicável | Associar erro ao campo, mover ou anunciar foco/status quando necessário e confirmar ações concluídas. |
| 6.7 | Agrupar campos de formulário | Condicional | Usar `fieldset` e `legend` para escolhas ou grupos relacionados; avaliar situação de leitura e futuros grupos de opções. |
| 6.8 | Fornecer estratégias de segurança específicas em vez de CAPTCHA | N/A atual | O MVP não utiliza CAPTCHA; priorizar alternativas acessíveis se proteção adicional for necessária. |

## Elementos padronizados do eMAG

O capítulo 4 do eMAG também descreve cinco elementos para páginas do Governo Federal. Eles não são automaticamente obrigatórios para este produto privado, mas geram as seguintes decisões de projeto:

| Elemento | Decisão para o LendoJuntos |
| --- | --- |
| Atalhos de teclado | Não criar atalhos proprietários nesta etapa. Priorizar navegação nativa e link “Ir para o conteúdo”. |
| Primeira folha de contraste | Testar compatibilidade com temas de contraste/`forced-colors`; avaliar tema próprio somente se houver necessidade validada. |
| Barra de acessibilidade | Não duplicar controles nativos de zoom. Tornar o link de salto e uma futura página de acessibilidade fáceis de localizar. |
| Mapa do sítio | A arquitetura atual tem nove telas e navegação curta; o inventário de rotas atende ao planejamento, sem justificar um mapa público agora. |
| Página com recursos de acessibilidade | Candidata para etapa posterior, reunindo recursos disponíveis, limitações conhecidas e canal de feedback. |

## Processo adotado

O estudo reforça um ciclo que será usado na Semana 3: padrões Web → recomendações de acessibilidade → validação automática → validação manual → teste com pessoas. Resultados automáticos não serão usados isoladamente para afirmar que uma tela é acessível.

## Referências consultadas em 03/09/2026

- [Modelo de Acessibilidade em Governo Eletrônico — página oficial do Governo Digital](https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade)
- [eMAG 3.1 — versão HTML](https://emag.governoeletronico.gov.br/)
- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/)
- [Easy Checks — W3C WAI](https://www.w3.org/WAI/test-evaluate/preliminary/)
