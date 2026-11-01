# Semana 10 — cartões, links e estados acessíveis

## Resultado do lote

O lote previsto para 26/10 a 01/11/2026 foi concluído e retestado em 01/11/2026. Dashboard, clube, livros e encontros deixaram de usar cartões ou painéis com `role="link"`, `tabIndex` e eventos que imitavam um link. A navegação agora parte de links nativos nos títulos, enquanto favorito, curtida, ingresso e demais ações permanecem como botões irmãos.

Favorito, curtida, situação da leitura e presença também expõem estado programático, nome contextual e mensagem de resultado. O lote conclui A11Y-006 e A11Y-010 no recorte definido pelo backlog e amplia a cobertura de mensagens de status de A11Y-003, que ainda permanece parcial até a Semana 11.

## Escopo

| Tela | Rota | Alterações principais |
| --- | --- | --- |
| Dashboard (T03) | `/dashboard` | links nativos nos nomes dos clubes; favorito separado e com estado |
| Clube (T04) | `/clubs/:id` | links no livro atual, próximo encontro e itens resumidos; destinos explícitos para listas completas |
| Livros do clube (T05) | `/clubs/:id/books` | título-link e botão de curtida irmão em cada cartão |
| Livro (T06) | `/books/:id` | encontros com título-link; curtida e situação da leitura com estado programático |
| Encontros do clube (T07) | `/clubs/:id/meetings` | títulos como links nativos, sem contêiner focável |
| Encontro (T08) | `/clubs/:id/meetings/:meetingId` | presença como alternância nomeada, ocupada e com foco preservado |

## Composição dos cartões

O padrão anterior colocava função de link no contêiner inteiro e reproduzia a ativação com eventos de clique e teclado. Esse desenho exigia tratamento especial para impedir que botões internos também navegassem e fazia a tecla Espaço se comportar como navegação.

O padrão implementado segue o contrato do protótipo:

```text
article
├── h3 > Link com destino real
├── descrição e metadados
└── botões irmãos, quando existirem
```

- os contêineres não possuem `role="link"`, `tabIndex`, `onClick` ou `onKeyDown`;
- `Enter` no título ativa o comportamento nativo do link;
- `Espaço` no botão executa somente a ação do botão;
- links para livros ou encontros relacionados continuam independentes;
- títulos-link são sublinhados para que a função não dependa apenas de cor;
- os painéis de resumo do clube oferecem “Ver todos os livros” e “Ver todos os encontros”.

## Estados das alternâncias

| Controle | Estado exposto | Nome e resposta |
| --- | --- | --- |
| favorito do clube | `aria-pressed` | inclui o nome do clube e alterna entre Favoritar/Remover |
| curtida do livro | `aria-pressed` | inclui o título do livro e alterna entre Curtir/Remover |
| situação da leitura | `fieldset` + `legend` e `aria-pressed` | opção atual recebe “selecionado” também em texto |
| presença no encontro | `aria-pressed`, `aria-busy` e `aria-disabled` | inclui o título do encontro e mantém o foco durante o envio |

A situação da leitura permanece visível para membros. O `fieldset` fica desabilitado e informa que somente administradores podem alterar o valor, mas a opção atual continua identificável por texto e estado programático.

Na confirmação de presença, o primeiro reteste encontrou perda de foco causada pelo atributo nativo `disabled` durante a requisição. O controle passou a usar `aria-disabled="true"` com bloqueio no manipulador, preservando foco e impedindo envio duplicado enquanto mostra “Salvando...”.

## Mensagens dinâmicas

As atualizações usam regiões com `role="status"` e incluem objeto e resultado:

- “Entre Capítulos adicionado aos favoritos.”;
- “Torto Arado curtido.”;
- “Situação de Torto Arado alterada para Planejado.”;
- “Presença confirmada em Capítulos 8 a 14.”.

O foco permanece no botão acionado. A revisão global de carregamentos, erros e demais feedbacks continua no lote da Semana 11.

## Evidências visuais

- [dashboard com título-link e favorito pressionado](evidencias-acessibilidade/semana-10/dashboard-links-e-favorito.png);
- [livros com títulos-link e curtida pressionada](evidencias-acessibilidade/semana-10/livros-links-e-curtida.png);
- [próximos encontros e histórico com links nativos](evidencias-acessibilidade/semana-10/encontros-links-nativos.png).

As capturas usam somente dados fictícios. A evidência programática e os passos completos estão em [semana-10-validar-cartoes-estados.mjs](semana-10-validar-cartoes-estados.mjs).

## Reteste executado

Data: 01/11/2026. Ambiente: Chrome 156 em modo headless, protocolo CDP, frontend Vite local e respostas da API simuladas sem persistência.

| Verificação | Cobertura | Resultado |
| --- | --- | --- |
| ESLint | frontend completo | aprovado, sem erros |
| TypeScript e build Vite | frontend completo | aprovado, 113 módulos transformados |
| cartões simulados | T03–T07 | 0 ocorrências de `role="link"` ou `.clickable-card` |
| links nativos | clubes, livros e encontros | destinos reais e ativação por `Enter` |
| ordem de foco | contêineres e ações | contêineres fora da tabulação; links e botões separados |
| favorito | dashboard e clube | nome contextual, `aria-pressed`, anúncio e foco preservado |
| curtida | lista e detalhe do livro | nome contextual, `aria-pressed`, anúncio e foco preservado |
| situação da leitura | administrador e membro | grupo nomeado, opção única, estado textual e indisponibilidade explicada |
| presença | detalhe do encontro | estado, ocupação, lista atualizada, anúncio e foco preservado |
| foco após navegação | clube, livro e encontro | `h1` recebe foco após `Enter` no link |
| reflow | T03–T08 em 320 CSS px | 6/6 sem overflow horizontal |

Execução dedicada: `node docs/semana-10-validar-cartoes-estados.mjs`, com os pré-requisitos registrados no próprio arquivo.

## Rastreabilidade

| ID | Estado após a Semana 10 | Evidência |
| --- | --- | --- |
| A11Y-003 | parcial | alternâncias de T03–T08 anunciam resultado contextual; revisão global segue na Semana 11 |
| A11Y-006 | concluído | cartões e painéis de T03–T08 usam links nativos com ações irmãs |
| A11Y-010 | concluído | favorito, curtida, leitura e presença expõem nome, valor e estado sem depender de cor ou ícone |

Critérios WCAG diretamente tratados: 1.3.1 (Informações e relações), 1.4.1 (Uso de cor), 2.1.1 (Teclado), 2.4.4 (Finalidade do link no contexto), 2.4.7 (Foco visível), 4.1.2 (Nome, função e valor) e 4.1.3 (Mensagens de status).

## Checklist da Semana 10

- [x] confirmar o recorte no cronograma, backlog, fluxos e protótipo;
- [x] remover função de link dos contêineres e os manipuladores simulados;
- [x] adicionar título-link com destino real aos cartões de clube, livro e encontro;
- [x] manter favorito, curtida, ingresso e links relacionados como controles irmãos;
- [x] expor `aria-pressed` e nomes contextuais nas alternâncias;
- [x] nomear a situação da leitura e indicar a opção selecionada em texto;
- [x] informar indisponibilidade da situação para membros;
- [x] anunciar atualizações e preservar o foco no acionador;
- [x] validar as seis rotas em 320 CSS px;
- [x] gerar três capturas sem dados pessoais;
- [x] executar lint, build e o roteiro de navegação/estados;
- [x] atualizar o índice e o registro acadêmico de horas.

## Horas registradas

| Atividade | Horas |
| --- | ---: |
| Revisão do cronograma, backlog, fluxos e contrato do protótipo | 0,5 h |
| Implementação dos links nativos em T03–T07 | 1,5 h |
| Implementação e revisão das quatro alternâncias | 1,0 h |
| Roteiro automatizado, reflow e correção da perda de foco | 1,5 h |
| Capturas, documentação e registro acadêmico | 0,5 h |
| **Total** | **5,0 h** |

O registro acadêmico agora totaliza 44 horas propostas executadas, incluindo 20 horas na etapa “Execução da intervenção”. A coluna “Horas Aceitas” permanece reservada ao professor.

## Limites desta execução

O roteiro confirma semântica no DOM, destinos, ativação por teclado, estado programático, foco, mensagens e reflow no Chromium. Ele não substitui a escuta das mudanças com NVDA, o zoom real de 400%, o alto contraste real do Windows nem a validação com pessoas, previstos para as Semanas 11 e 13. As respostas da API foram simuladas; o backend e os dados persistidos não foram alterados.
