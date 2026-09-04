# Semana 2 — inventário de telas e fluxos críticos

## Escopo e método

O inventário foi construído a partir das rotas React, componentes compartilhados, chamadas da API e execução da stack com dados de demonstração. Ele delimita a superfície que deverá ser auditada na Semana 3 e impede que a avaliação se restrinja à página inicial.

Foram identificadas **9 telas**, **10 estados de sobreposição** e **6 jornadas essenciais**. Estados de carregamento, vazio, erro, sucesso e variações de permissão fazem parte da tela correspondente e devem ser amostrados.

## Telas

| ID | Rota | Tela e público | Conteúdo e ações principais | Estados/variações a incluir | Prioridade |
| --- | --- | --- | --- | --- | --- |
| T01 | `/` | Login; público | E-mail, senha, envio e link para cadastro | vazio, validação nativa, credencial inválida, enviando, sucesso | Crítica |
| T02 | `/register` | Cadastro; público | Nome, e-mail, senha, envio e retorno ao login | vazio, restrição de senha, e-mail existente, enviando, sucesso | Crítica |
| T03 | `/dashboard` | Clubes; autenticado | Navegação global, métricas, criar clube, abrir/favoritar/ingressar | carregando, erro, listas vazias, membro/não membro, favorito, modal | Crítica |
| T04 | `/clubs/:id` | Detalhes do clube; membro | Livro atual, próximo encontro, membros, resumos, favorito, editar/sair/excluir | admin/membro/criador, sem livro, sem encontro, listas longas, 3 modais, menu | Crítica |
| T05 | `/clubs/:id/books` | Livros do clube; membro | Listar/abrir/curtir livros e cadastrar livro | admin/membro, vazio, status, favorito/curtida, modal, feedback | Alta |
| T06 | `/books/:id` | Livro; membro | Detalhes, mudar status, curtir, encontros e comentários | admin/membro, sem encontros/comentários, status, envio de comentário | Crítica |
| T07 | `/clubs/:id/meetings` | Encontros do clube; membro | Próximos, histórico, abrir e criar encontro | admin/membro, listas vazias, datas/local, modal, feedback | Alta |
| T08 | `/clubs/:id/meetings/:meetingId` | Detalhes do encontro; membro | Pauta, livro, presença, participantes, comentários, editar/excluir | confirmado/não confirmado, admin/membro, listas vazias, 2 modais, menu | Crítica |
| T09 | `/profile` | Perfil; autenticado | Editar nome e biografia | vazio, obrigatório, erro e confirmação de salvamento | Alta |

## Componentes e estados transversais

| ID | Componente/estado | Onde aparece | Pontos mínimos de acessibilidade |
| --- | --- | --- | --- |
| C01 | Cabeçalho e navegação | T03–T09 | landmark, nome da navegação, item atual, ordem, foco, link de salto, reflow |
| C02 | Cartão clicável | T03–T08 | semântica de link, nome, Enter, ausência de ação aninhada problemática, foco |
| C03 | Botão favorito/curtida | T03–T06 | nome e estado programáticos, texto alternativo ao símbolo/cor, alvo e feedback |
| C04 | Menu de ações (`details/summary`) | T04 e T08 | nome do acionador, expandido/recolhido, Escape, ordem e retorno de foco |
| C05 | Modal genérico | 8 tipos em T03–T08 | nome, descrição, foco inicial, contenção, Escape, fundo inerte e retorno |
| C06 | Formulário | T01–T09 | rótulo, instrução, autocomplete, obrigatório, erro associado e confirmação |
| C07 | Feedback dinâmico | T01–T09 | região viva adequada, mensagem compreensível, persistência e foco quando necessário |
| C08 | Carregamento | T03–T08 e rota protegida | anúncio de ocupado/carregando e transição sem perda de contexto |
| C09 | Estado vazio | T03–T08 | linguagem clara, próximo passo e ausência de dependência visual |
| C10 | Lista rolável | T04 | alcance por teclado, foco não oculto, reflow e indicação de mais conteúdo |

### Sobreposições inventariadas

1. criar clube;
2. editar clube;
3. excluir clube;
4. sair do clube;
5. cadastrar livro;
6. criar encontro;
7. editar encontro;
8. excluir encontro;
9. menu de ações do clube;
10. menu de ações do encontro.

Os oito primeiros usam o componente `Modal`; os dois últimos usam `ActionMenu`. A mesma correção no componente compartilhado pode afetar várias jornadas, mas cada variação precisa de ao menos uma verificação de conteúdo, foco e ações.

## Fluxos críticos

| ID | Jornada | Caminho e conclusão esperada | Controles/estados críticos | Modos de acesso a testar |
| --- | --- | --- | --- | --- |
| F01 | Criar conta, entrar e sair | T02 → T03; T01 → T03; Sair → T01 | campos, autocomplete, restrições, erro, botão ocupado, mudança de rota | teclado, NVDA, zoom, contraste |
| F02 | Localizar e ingressar em clube | T03 → cartão/Ingressar → T04 | listas, cartões, favorito, feedback, contexto do clube | teclado, NVDA, zoom, contraste |
| F03 | Consultar leitura atual e histórico | T04 → T05/T06 → mudança de status | painel clicável, cartões, controle segmentado, curtida, estados de leitura | teclado, NVDA, zoom, contraste |
| F04 | Consultar encontro e confirmar presença | T04/T07 → T08 → confirmar/cancelar | cartão, data/local, livro relacionado, botão com estado, participantes, feedback | teclado, NVDA, zoom, contraste |
| F05 | Ler e publicar comentários | T06/T08 → campo → publicar → novo item | identificação do autor/data, textarea, validação, atualização dinâmica | teclado, NVDA, zoom, contraste |
| F06 | Administrar clube, livro e encontro | T03/T04/T05/T07/T08 → menus/modais → salvar ou confirmar | permissões, menus, diálogos, formulários, exclusão, foco e confirmação | teclado, NVDA, zoom, contraste |

## Roteiros mínimos da auditoria

### F01 — autenticação

1. Abrir login, compreender o propósito e alcançar o primeiro campo.
2. Enviar dados vazios, inválidos e válidos; localizar e compreender o erro.
3. Confirmar a mudança de contexto após sucesso.
4. Repetir no cadastro e encerrar a sessão pelo cabeçalho.

### F02 — clube

1. Identificar seções “Meus clubes” e “Clubes disponíveis”.
2. Abrir um cartão e voltar sem perder contexto.
3. Favoritar/desfavoritar e verificar nome, estado e anúncio.
4. Ingressar em um clube disponível e confirmar a mudança de estado.

### F03 — livros

1. Localizar o livro atual na página do clube.
2. Abrir todos os livros e distinguir planejado, em leitura e concluído sem depender de cor.
3. Abrir detalhes, alterar estado quando permitido e verificar confirmação.
4. Curtir/descurtir e acessar o histórico sem ambiguidades.

### F04 — encontros e presença

1. Distinguir próximo encontro e histórico.
2. Abrir o encontro e compreender data, horário, local, pauta e livro.
3. Confirmar e cancelar presença; verificar estado do botão, lista e anúncio.
4. Voltar à lista com contexto previsível.

### F05 — comentários

1. Localizar título e quantidade de comentários.
2. Ler autor, data e conteúdo em ordem coerente.
3. Publicar comentário vazio e válido.
4. Confirmar que erro ou novo comentário seja anunciado sem busca visual.

### F06 — administração

1. Abrir e fechar menu de ações por teclado.
2. Criar/editar clube, livro e encontro nos respectivos diálogos.
3. Cancelar cada diálogo e confirmar retorno ao acionador.
4. Executar uma confirmação não destrutiva em dados de teste; para exclusão, validar até a etapa anterior à ação ou usar dados descartáveis.

## Matriz de cobertura por recurso

| Superfície | Teclado | NVDA | 200% | 400%/320 px | Contraste do sistema | Estado dinâmico |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| T01–T02 Autenticação | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T03 Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T04 Clube | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T05–T06 Livros | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T07–T08 Encontros | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T09 Perfil | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| C04–C05 Menus e modais | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

O símbolo indica cobertura planejada, não aprovação.

## Critérios para ordenar a auditoria da Semana 3

1. Bloqueia a conclusão de F01–F06 sem mouse ou sem visão.
2. Pode causar perda de dados, ação destrutiva ou estado incorreto.
3. Afeta componente compartilhado e, portanto, várias telas.
4. Afeta compreensão de erro, confirmação ou mudança de contexto.
5. Surge em 320 CSS px, zoom, tema de contraste ou conteúdo longo.

Com esses critérios, o primeiro lote deverá conter modal, mudança de rota, feedback dinâmico, cartões que simulam links, foco visível e títulos de página. Severidade final só será atribuída após reprodução na linha de base.

## Rastreabilidade no código

- Rotas: `frontend/src/routes/AppRoutes.tsx`
- Navegação global: `frontend/src/components/AppLayout.tsx`
- Modais: `frontend/src/components/Modal.tsx`
- Menu de ações: `frontend/src/components/ActionMenu.tsx`
- Telas: `frontend/src/pages/`
- Estilos e responsividade: `frontend/src/index.css`
- Cliente da API e feedbacks: `frontend/src/services/api.ts`
- Roteiro automatizado exploratório: [semana-02-experimento-browser.mjs](semana-02-experimento-browser.mjs)
