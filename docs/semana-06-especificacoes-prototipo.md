# Semana 6 — especificações para implementação do protótipo

## Finalidade

Este handoff converte o [protótipo de alta fidelidade](semana-06-prototipo-alta-fidelidade.md) e o [guia visual](semana-06-guia-visual-acessibilidade.md) em requisitos verificáveis para o frontend React. As mudanças são implementadas nos lotes das Semanas 7–11; este documento não autoriza marcar achados como concluídos antes do reteste.

## Ordem de implementação

| Lote | Semana | Base visual/técnica | Itens |
| --- | :---: | --- | --- |
| Fundações | 7 | tokens, foco, layout, link de salto, títulos e contexto de rota | A11Y-002, A11Y-004, A11Y-005, A11Y-008 |
| Sobreposições | 8 | contrato de diálogo e menu do protótipo | A11Y-001, A11Y-012, A11Y-013 |
| Formulários e feedback | 9–11 | campo, erro, status, revisão e finalidades | A11Y-003, A11Y-009, A11Y-011, A11Y-014 |
| Conteúdo e interação | 9–10 | cartões, links e alternâncias | A11Y-006, A11Y-007, A11Y-010 |
| Automação | 11 | cenários representativos do protótipo e estados reais | regressão dos itens anteriores |

## Contrato do layout

Arquivos-alvo iniciais: `AppLayout.tsx`, `AppRoutes.tsx`, `index.css` e páginas T01–T09.

- inserir “Ir para o conteúdo principal” antes do cabeçalho autenticado;
- renderizar um único `main` com `id="conteudo-principal"` por rota;
- definir título do documento “{Tela} — LendoJuntos”;
- depois de navegação SPA iniciada pela aplicação, focar o `h1` com `tabindex="-1"` temporário ou solução equivalente;
- manter restauração previsível no Voltar e não deixar foco no `body`;
- marcar o link atual com `aria-current="page"`;
- manter marca, navegação, usuário e saída na mesma ordem do DOM vista no protótipo;
- aplicar os breakpoints sem alterar a sequência de leitura.

## Contrato de foco e controles

- todos os elementos interativos recebem o padrão global de `:focus-visible` do guia;
- não usar `outline: none` sem substituto com contraste medido;
- links navegam; botões alteram estado ou executam ação;
- não usar `tabindex` positivo;
- controles desabilitados permanecem distinguíveis por texto/contexto, não só opacidade;
- alvo mínimo: 44 × 44 CSS px, salvo exceção documentada do critério 2.5.8;
- foco não pode ficar encoberto por cabeçalho, diálogo, menu ou região rolável.

## Contrato de cartão

Aplicável a clubes, livros, encontros e painéis atualmente clicáveis.

```text
article/list item
├── metadados e estado textual
├── h3 > Link com destino real
├── descrição
└── grupo de botões irmãos (favoritar, curtir, ingressar)
```

- remover `role="link"`, `tabIndex=0` e handlers de teclado do contêiner;
- Enter no link navega; Espaço no botão executa somente a ação do botão;
- não colocar botão dentro do link;
- o nome de alternância inclui o objeto, e `aria-pressed` representa o estado;
- atualização mantém foco no botão e anuncia uma única mensagem.

## Contrato de formulário e feedback

Cada campo deve receber:

1. `label` visível com associação explícita;
2. instrução persistente quando houver formato ou restrição;
3. `autocomplete` apropriado para nome, e-mail e senhas;
4. `aria-invalid="true"` somente enquanto inválido;
5. `aria-describedby` para instrução e erro ativos;
6. mensagem que identifica o problema e sugere correção conhecida;
7. preservação dos valores válidos depois de erro.

Sucesso e atualização não urgente usam `role="status"`/`aria-live="polite"`. Erro que exige ação pode usar alerta, desde que seja criado/atualizado uma vez. Carregamento expõe nome e `aria-busy` quando a região existente estiver sendo atualizada.

Decisão de prevenção de erro:

- comentário de livro e encontro: revisar antes de publicar;
- perfil: revisar Nome e Biografia antes de salvar;
- criar/editar: campos permanecem no diálogo e podem ser corrigidos antes do envio;
- excluir/sair: confirmação explícita identifica objeto e consequência;
- se a implementação escolher desfazer em vez de revisão, deverá registrar equivalência e retestar A11Y-014.

## Contrato do diálogo

Componente-alvo: `Modal.tsx` e oito variações.

| Requisito | Especificação |
| --- | --- |
| Nome | título visível com ID referenciado por `aria-labelledby` |
| Modalidade | `dialog` nativo com `showModal()` ou `role="dialog"` + `aria-modal="true"` e fundo inerte |
| Foco inicial | primeiro campo em formulário; Cancelar em confirmação destrutiva |
| Contenção | `Tab`/`Shift+Tab` permanecem no diálogo |
| Saídas | `Escape`, Fechar e Cancelar não executam a ação principal |
| Retorno | acionador original, se ainda existir; contexto sobrevivente após exclusão |
| Ponteiro | apenas clique concluído no próprio fundo fecha |
| Reflow | largura máxima relativa e rolagem interna sem ocultar título/ações |

O protótipo usa `dialog` nativo para demonstrar modalidade e foco. A decisão final deve considerar suporte dos navegadores-alvo e possuir teste automatizado e manual.

## Contrato do menu de ações

Componente-alvo: `ActionMenu.tsx` nas telas de clube e encontro.

- acionador textual: “Ações do clube” ou “Ações do encontro”;
- expandido/recolhido exposto pelo elemento nativo ou `aria-expanded`;
- opções inexistentes na ordem de foco enquanto fechado;
- `Escape` fecha e foca o acionador;
- clique externo concluído fecha sem ativação acidental;
- escolher uma ação fecha o menu antes de abrir o diálogo;
- em largura estreita, painel usa a largura disponível e não ultrapassa a viewport.

## Contrato de estado visual

| Estado | Texto/semântica | Aparência mínima |
| --- | --- | --- |
| Atual | `aria-current` ou rótulo textual | preenchimento + contraste |
| Pressionado | `aria-pressed` e nome coerente | fundo/borda + texto atualizado |
| Erro | mensagem ligada ao campo | borda de 2 px + fundo + texto |
| Sucesso | mensagem em região de status | fundo/borda + texto |
| Desabilitado | atributo nativo e motivo no contexto | contraste suficiente; não apenas cor |
| Destrutivo | verbo e objeto explícitos | vermelho + confirmação |
| Carregando | texto “Carregando/Salvando” e ocupado | botão preserva dimensões e impede duplicidade |
| Vazio | explicação e próximo passo permitido | painel tracejado, sem ícone obrigatório |

## Requisitos de reflow

- nenhuma rota deve impor `min-width` ao documento;
- grids usam `minmax(0, 1fr)` e se tornam uma coluna nos breakpoints;
- textos, URLs e títulos longos usam quebra segura;
- botões podem quebrar o texto e crescer verticalmente;
- menu deixa de ser posicionado fora do fluxo na menor faixa;
- diálogos respeitam largura e altura da viewport;
- o resultado deve repetir 9/9 telas sem overflow em 1280, 640 e 320 CSS px;
- zoom real de 200%/400% e espaçamento de texto permanecem validações manuais obrigatórias.

## Rastreabilidade com A11Y-001–014

| ID | Especificação de saída |
| --- | --- |
| A11Y-001 | contrato do diálogo aplicado às oito variações |
| A11Y-002 | título e foco do `h1` após rota |
| A11Y-003 | status/alerta por ação e carregamento nomeado |
| A11Y-004 | foco global conforme token e cores forçadas |
| A11Y-005 | link de salto e `main` único |
| A11Y-006 | composição de cartão com link nativo e botões irmãos |
| A11Y-007 | autenticação em uma coluna e sem largura mínima |
| A11Y-008 | tokens medidos e nova medição no fundo real |
| A11Y-009 | erro associado, correção e preservação de dados |
| A11Y-010 | alternância com estado programático e texto |
| A11Y-011 | `autocomplete` de nome, e-mail e senhas |
| A11Y-012 | menu contextual, expansão, `Escape` e retorno |
| A11Y-013 | fechamento no clique concluído do fundo |
| A11Y-014 | revisão de comentário/perfil e confirmação destrutiva |

## Verificação exigida por lote

1. lint, TypeScript e build sem erro;
2. cenário funcional sem regressão;
3. teclado completo com foco visível;
4. 1280, 640 e 320 CSS px sem perda ou rolagem horizontal indevida;
5. `prefers-reduced-motion` e `forced-colors` quando aplicáveis;
6. axe-core/Lighthouse pertinente, com itens incompletos revisados;
7. contraste medido no estado e fundo reais;
8. evidência antes/depois vinculada ao ID do backlog.

## Critério de pronto do handoff

O handoff está pronto porque define tokens, estados, componentes, responsividade, foco, prevenção de erro, critérios por backlog e verificações. Dúvidas de implementação devem ser resolvidas preservando primeiro HTML nativo, nome/estado programático, ordem do DOM e critérios de aceite já documentados.
