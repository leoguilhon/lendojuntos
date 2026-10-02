# Semana 6 — protótipo acessível de alta fidelidade

## Identificação

| Item | Definição |
| --- | --- |
| Período | 28/09/2026 a 04/10/2026 |
| Data de consolidação | 02/10/2026, fuso America/Sao_Paulo |
| Escopo | T01–T09, C01–C10 e F01–F06 |
| Entradas | [wireframes da Semana 5](semana-05-wireframes-acessiveis.md) e [fluxos anotados](semana-05-fluxos-anotados.md) |
| Entregas | protótipo navegável, [guia visual](semana-06-guia-visual-acessibilidade.md) e [especificações de implementação](semana-06-especificacoes-prototipo.md) |
| Natureza | artefato de design isolado; não altera o frontend de produção |

## Resultado

O protótipo materializa as decisões estruturais da Semana 5 com identidade visual, tipografia responsiva, contraste medido, foco perceptível e estados que combinam texto, forma e estado programático. As nove telas usam dados fictícios e componentes interativos locais, sem chamadas à API nem persistência.

Ponto de entrada: [dashboard do protótipo](prototipo-semana-06/index.html).

Para abrir com todas as rotas e recursos relativos funcionando, a partir da raiz do repositório:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Depois, acessar `http://127.0.0.1:8765/docs/prototipo-semana-06/`.

## Inventário das telas

| ID | Arquivo | Conteúdo e estados representados |
| --- | --- | --- |
| T01 | [login.html](prototipo-semana-06/login.html) | propósito, e-mail, senha, `autocomplete`, validação e entrada |
| T02 | [cadastro.html](prototipo-semana-06/cadastro.html) | nome, e-mail, nova senha, instrução e retorno ao login |
| T03 | [index.html](prototipo-semana-06/index.html) | cabeçalho, métricas, listas, cartões, favorito, ingresso e criar clube |
| T04 | [clube.html](prototipo-semana-06/clube.html) | livro atual, próximo encontro, membros, resumos, favorito, menu e confirmações |
| T05 | [livros.html](prototipo-semana-06/livros.html) | lista de livros, estados textuais, curtida e cadastro |
| T06 | [livro.html](prototipo-semana-06/livro.html) | detalhes, situação da leitura, curtida, encontros, comentários e revisão |
| T07 | [encontros.html](prototipo-semana-06/encontros.html) | próximos, histórico, estados textuais e criação |
| T08 | [encontro.html](prototipo-semana-06/encontro.html) | pauta, presença, comentários, menu, edição, exclusão e revisão |
| T09 | [perfil.html](prototipo-semana-06/perfil.html) | dados da conta, campos editáveis e revisão antes de salvar |

Arquivos compartilhados:

- [styles.css](prototipo-semana-06/styles.css): tokens, componentes, foco, responsividade, redução de movimento e cores forçadas;
- [prototype.js](prototipo-semana-06/prototype.js): foco pós-navegação, alternâncias, status, menus, diálogos e revisões;
- [validate.mjs](prototipo-semana-06/validate.mjs): verificação reproduzível em Chromium por CDP.

## Cobertura dos componentes

| ID | Representação no protótipo |
| --- | --- |
| C01 | cabeçalho, navegação, link de salto, item atual e reflow nas sete telas autenticadas |
| C02 | cartões com título-link e ações irmãs em clubes, livros e encontros |
| C03 | favorito/curtida com nome contextual, texto atualizado e `aria-pressed` |
| C04 | menus “Ações do clube” e “Ações do encontro”, inclusive `Escape` |
| C05 | diálogos de criar, editar, excluir, revisar e confirmar com fundo modal |
| C06 | formulários de autenticação, clube, livro, encontro, comentário e perfil |
| C07 | região de status para alternância, salvamento, erro e publicação |
| C08 | contrato de carregamento especificado no handoff; sem API no protótipo estático |
| C09 | composição visual de estado vazio especificada em `styles.css` e no handoff |
| C10 | regiões e listas seguem ordem do DOM e preservam foco em reflow |

## Interações prototipadas

| Padrão | Comportamento demonstrado |
| --- | --- |
| Mudança de tela | o link registra a transição e o `h1` da nova tela recebe foco programático |
| Link de salto | primeiro controle das telas autenticadas; leva ao `main` atual |
| Cartão | título é link nativo; alternância ou ação permanece como botão irmão |
| Favorito, curtida e presença | botão expõe `aria-pressed`, atualiza o texto e anuncia o resultado |
| Situação da leitura | grupo nomeado e opção selecionada indicada por texto e `aria-pressed` |
| Feedback | região de status persistente recebe mensagens sem mover foco indevidamente |
| Formulário | rótulo visível, ajuda ligada ao campo, finalidade conhecida e validação nativa |
| Comentário | revisão mostra o conteúdo antes de publicar e permite voltar para editar |
| Perfil | revisão apresenta os valores antes de salvar |
| Menu de ações | `details/summary` expõe expansão; `Escape` fecha e devolve foco ao acionador |
| Diálogo | `dialog.showModal()` torna o fundo inerte, recebe nome, define foco inicial, aceita `Escape` e retorna ao acionador |
| Clique no fundo | fechamento ocorre no evento de clique concluído no próprio fundo, não no pressionamento inicial |

## Estados visuais incluídos

- padrão, hover, foco, pressionado/selecionado e desabilitado;
- sucesso e erro com texto, borda e fundo, sem depender somente de cor;
- Planejado, Em leitura, Concluído, Próximo e Realizado sempre escritos;
- menu e diálogo abertos;
- validação obrigatória e instrução persistente;
- conteúdo em duas ou três colunas e sua sequência em coluna única;
- `prefers-reduced-motion` e `forced-colors`.

Estados carregando, erro de API e listas vazias têm especificação no handoff, mas não executam chamadas reais porque o protótipo é estático.

## Validação executada

O roteiro [validate.mjs](prototipo-semana-06/validate.mjs) foi executado em 02/10/2026 com Chrome em modo headless e servidor HTTP local.

| Verificação | Resultado |
| --- | --- |
| 9 telas em 1280 CSS px | 9/9 sem overflow horizontal |
| 9 telas em 640 CSS px | 9/9 sem overflow horizontal |
| 9 telas em 320 CSS px | 9/9 sem overflow horizontal |
| `lang`, título, um `h1` e um `main` | 27/27 combinações aprovadas |
| IDs únicos e hierarquia sem salto | 27/27 combinações aprovadas |
| Campos com rótulo e controles com nome | 27/27 combinações aprovadas |
| Imagens e recursos | nenhum recurso quebrado |
| Console/execução | nenhum erro observado |
| Diálogo Criar clube | abriu, focou Nome e devolveu foco ao acionador |
| Menu Ações do clube | `Escape` fechou e manteve foco no acionador |
| Inspeção visual | dashboard conferido em 1280 × 900 e 320 × 900 |

O roteiro automatizado verifica estrutura e reflow, não qualidade de leitura, contraste de pixels resultantes nem experiência com tecnologia assistiva. As razões de contraste dos tokens foram calculadas separadamente no guia visual. NVDA, zoom real, espaçamento de texto e contraste real do Windows continuam previstos para a Semana 13.

## Cobertura dos fluxos

| Fluxo | Caminho no protótipo | Evidência de desenho |
| --- | --- | --- |
| F01 | Cadastro/Login → Dashboard → Perfil/Sair | finalidades dos campos, validação e foco de rota |
| F02 | Dashboard → Clube | links de cartão, favorito, ingresso e status |
| F03 | Clube → Livros → Livro | estados textuais, grupo de situação e curtida |
| F04 | Clube/Encontros → Encontro | dados completos e presença alternável |
| F05 | Livro/Encontro → revisão do comentário | erro obrigatório, revisão e publicação anunciada |
| F06 | Dashboard/Clube/Livros/Encontros → menus/diálogos | nome, foco inicial, cancelamento, confirmação e retorno |

## Limites da conclusão

O protótipo confirma decisões de design e oferece uma referência executável para implementação. Ele não prova que o frontend React atual atende à WCAG, não encerra A11Y-001–014 e não substitui os testes manuais definidos na Semana 4. Dados não são persistidos e algumas ações apenas atualizam o estado visual ou a região de status.
