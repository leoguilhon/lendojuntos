# Semana 2 — notas dos recursos assistivos

## Objetivo

Registrar a experimentação inicial do LendoJuntos com teclado, NVDA, zoom/reflow e alto contraste. Esta é uma exploração orientadora, não a auditoria formal da linha de base nem uma declaração de conformidade.

## Ambiente e método

| Item | Configuração |
| --- | --- |
| Data local | 03/09/2026, fuso America/Sao_Paulo |
| Aplicação | Stack Docker do repositório, frontend em `http://localhost:4173`, API e dados seed habilitados |
| Navegador automatizado | Microsoft Edge 152.0.4191.62, motor Chromium, Chrome DevTools Protocol |
| Leitor de tela | NVDA 2026.2 oficial em cópia portátil temporária, interface `pt-BR`, complementos desabilitados |
| Integridade do NVDA | SHA-256 do instalador `f3f8d29974a88d687b3c4809be192219ec579c5bdabcda5aaf53635288bca824`, igual ao publicado pela NV Access |
| Conta de demonstração | `ana@lendojuntos.test`; a senha não é registrada neste documento |
| Rotas observadas | 9 telas, todas percorridas também em larguras de conteúdo de 1280, 640 e 320 CSS px |

O roteiro reproduzível está em [semana-02-experimento-browser.mjs](semana-02-experimento-browser.mjs). Ele não altera dados: autentica, percorre rotas, inspeciona foco/estrutura, mede overflow e emula `forced-colors`.

## Síntese

| Recurso | Situação do ensaio | Resultado que pode ser afirmado |
| --- | --- | --- |
| Somente teclado | Executado | Login completo foi realizado; sequência básica é alcançável, mas o modal permite foco fora da sobreposição e não devolve foco ao acionador. |
| NVDA | Parcial/inconclusivo no conteúdo web | A cópia portátil iniciou e registrou fala/entrada. O Windows recusou transferir o foco programaticamente para o Edge isolado; não há base para afirmar compatibilidade da aplicação com NVDA. |
| Zoom/reflow | Executado por largura equivalente | As 9 telas ficaram sem overflow em 1280 e 640 CSS px. Em 320 CSS px, login e cadastro apresentaram overflow; as 7 telas autenticadas não. |
| Alto contraste | Executado por emulação `forced-colors` | A media query ficou ativa e o Chromium aplicou cores do sistema a texto, links e controles. Estados e foco ainda precisam de inspeção visual em tema real do Windows. |
| Estrutura exposta | Executado pela árvore de acessibilidade do Chromium | As telas têm um `h1`; telas autenticadas expõem `header`, `nav` e `main`; o diálogo testado é exposto sem nome acessível. |

## Experimento 1 — somente teclado

### Autenticação

Sequência observada a partir do início da página:

1. campo E-mail;
2. campo Senha;
3. botão “Entrar na plataforma”;
4. link “Criar conta”.

As credenciais foram digitadas e o formulário enviado apenas por eventos de teclado; o resultado foi a rota `/dashboard` com o título principal “Clubes do livro”. Não houve bloqueio nesta tarefa.

### Dashboard

A sequência inicial observada foi: marca → Clubes → Perfil → Sair → Criar clube → cartão do clube → Favoritar clube. O cartão inteiro usa `article role="link" tabindex="0"` e contém um botão, criando alvos interativos aninhados que exigem verificação cuidadosa com leitor de tela e podem ser substituídos por links nativos na implementação.

### Modal “Criar clube”

O ensaio identificou uma barreira reproduzível:

- ao abrir, o foco permaneceu no botão “Criar clube” atrás da sobreposição;
- o primeiro e o segundo `Tab` alcançaram o cartão do clube e o botão de favorito atrás do modal;
- somente depois o foco chegou a Fechar, Nome, Descrição e Cancelar;
- `Escape` fechou o modal, mas o foco terminou no `body`, não no acionador;
- a árvore de acessibilidade expôs `role="dialog"` com nome vazio, apesar do `h2` visual “Criar clube”.

Esse resultado será uma entrada prioritária da auditoria da Semana 3. A correção pertence à Semana 8 do cronograma: nome acessível, foco inicial, contenção, `Escape` e retorno de foco.

### Indicador de foco

Campos, botões e cartões recebem contorno de 3 px, mas a cor configurada é `rgba(198, 113, 67, 0.2)`. A composição estimada apresenta contraste de aproximadamente 1,23:1 a 1,25:1 contra os fundos claros usados ao redor, abaixo da referência de 3:1 para distinguir o indicador. Links comuns dependem do contorno padrão do Edge, resultando em tratamento inconsistente. A medição por estado e fundo será repetida na auditoria.

## Experimento 2 — NVDA

### Preparação executada

- download da versão estável 2026.2 no domínio oficial da NV Access;
- verificação do SHA-256 publicado;
- criação portátil, sem instalação permanente;
- inicialização com complementos desabilitados e log no nível de entrada/saída;
- confirmação no log de inicialização de UI Automation, IAccessible, idioma `pt-BR`, eventos de teclado e fala;
- confirmação de que o NVDA anunciou a interface do Edge, barra de endereço e conclusão do carregamento.

### Limitação e decisão

O Edge de teste foi aberto em perfil isolado e fora da área visível para não interromper o trabalho do usuário. O Windows recusou a transferência programática do primeiro plano para essa janela. Na tentativa seguinte, o foco retornou ao IDE e o NVDA passou a anunciar o conteúdo do IDE, não o LendoJuntos. A execução foi interrompida para não interferir na sessão ativa.

Consequentemente, **o ensaio NVDA no conteúdo da aplicação é inconclusivo**. A árvore de acessibilidade do Chromium foi usada apenas para preparar hipóteses; ela não substitui o NVDA nem o teste com pessoas. O teste manual assistido deverá ser realizado na Semana 3 ou 13 com uma sessão dedicada e os seguintes passos:

1. iniciar NVDA e Edge manualmente, com foco confirmado na página;
2. percorrer landmarks (`D`), títulos (`H`/`1`–`6`), campos (`F`) e lista de elementos (`NVDA+F7`);
3. executar os seis fluxos críticos do inventário;
4. registrar fala relevante, modo navegação/foco, bloqueios, mudança de rota e anúncios de status;
5. repetir diálogos e menu de ações verificando nome, estado e foco.

Nenhuma conclusão “compatível com NVDA” deve ser publicada antes dessa rodada.

## Experimento 3 — zoom e reflow

O critério de reflow foi aproximado pela alteração da largura útil do layout: 1280 CSS px como base, 640 CSS px como equivalente prático a 200% e 320 CSS px como equivalente a 400% em uma viewport inicial de 1280 px. O roteiro compensou a largura da barra de rolagem antes de medir.

| Largura útil | Telas sem overflow horizontal | Resultado |
| --- | ---: | --- |
| 1280 CSS px | 9/9 | Sem overflow detectado |
| 640 CSS px | 9/9 | Sem overflow detectado |
| 320 CSS px | 7/9 | Login e cadastro apresentaram overflow horizontal |

Foram cobertos login, cadastro, dashboard, clube, livros do clube, livro, encontros, encontro e perfil. Em 320 CSS px, o documento chegou a 376 px no login e a 333 px no cadastro. Os elementos apontados pertencem ao cabeçalho flexível `.auth-panel-head` e, no cadastro, seu tamanho mínimo também amplia `.auth-stage`, `.auth-story` e `.auth-panel`. A hipótese de causa deve ser confirmada visualmente antes da correção.

Limites: a medição automática compara `scrollWidth` e `clientWidth`; ela não determina sozinha se texto ficou encoberto, truncado ou visualmente sobreposto, nem se todas as ações continuam confortáveis. Modais abertos, menu de ações, strings longas e zoom real do navegador permanecem para inspeção visual da Semana 3.

## Experimento 4 — alto contraste

Com `forced-colors: active` emulado pelo Chromium:

- a media query foi confirmada como ativa;
- texto do corpo foi calculado como branco;
- links foram calculados em amarelo sobre fundo transparente;
- o botão amostrado recebeu texto e borda brancos sobre fundo escuro;
- conteúdo e controles permaneceram presentes no DOM.

O resultado mostra adaptação básica à paleta do sistema, não aprovação visual. Ainda é necessário testar um tema de contraste real do Windows e verificar foco, favorito, curtida, estado ativo da navegação, erros, campos, bordas, transparências e conteúdo desabilitado. Informações de estado devem continuar disponíveis em texto/nome, sem depender apenas da cor.

## Observações estruturais que orientam a Semana 3

| ID | Observação | Evidência | Próxima verificação |
| --- | --- | --- | --- |
| S2-01 | Modal sem foco inicial, contenção, retorno e nome acessível | Sequência de `Tab`, `Escape` e árvore AX | Repetir em todos os 8 tipos de modal e priorizar backlog |
| S2-02 | Título do documento é “LendoJuntos” nas nove telas | Inspeção de `document.title` | Definir título descritivo por rota e validar anúncio na SPA |
| S2-03 | Não há link para pular o cabeçalho repetido | Inspeção do DOM e primeira sequência de tabulação | Avaliar em teclado e NVDA |
| S2-04 | Foco customizado tem contraste estimado baixo | CSS calculado e composição de cor | Medir cada contexto e comparar com WCAG 2.2 |
| S2-05 | Cartões simulam links e contêm ações interativas | DOM e sequência de foco | Testar nome/ordem no NVDA e preferir semântica nativa |
| S2-06 | Feedbacks dinâmicos são parágrafos sem região viva | Inspeção do código | Testar anúncio após criar, editar, favoritar, curtir e confirmar presença |
| S2-07 | Mudanças de rota não gerenciam foco | Login remove o controle focado; nenhuma rotina de foco por rota | Testar anúncio de contexto no NVDA |
| S2-08 | Login e cadastro apresentam overflow em 320 CSS px; as telas autenticadas não | 27 medições; `.auth-panel-head` e contêineres públicos apontados | Confirmar visualmente a causa e testar zoom real |

## Referências consultadas em 03/09/2026

- [Guia do Usuário do NVDA 2026.2 — NV Access](https://download.nvaccess.org/documentation/pt_BR/userGuide.html)
- [NVDA 2026.2 — anúncio e hash oficial](https://www.nvaccess.org/post/nvda-2026-2/)
- [Easy Checks: teclado e foco — W3C WAI](https://www.w3.org/WAI/test-evaluate/preliminary/)
- [Developing a Keyboard Interface — WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Understanding SC 1.4.10 Reflow — W3C](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Temas de contraste no Windows — Microsoft Support](https://support.microsoft.com/en-US/accessibility/windows/change-color-contrast-in-windows)
