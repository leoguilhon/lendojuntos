# Semana 9 — formulários acessíveis de autenticação e perfil

## Resultado do lote

O lote previsto para 19/10 a 25/10/2026 foi concluído e retestado em 26/10/2026, com um dia de atraso em relação ao cronograma. Login, cadastro e perfil agora oferecem instruções antes do preenchimento, rótulos explícitos, finalidade dos campos, validação previsível, erros associados e anúncios de carregamento, falha e sucesso.

A edição do perfil também ganhou uma etapa de revisão: a API só recebe a alteração depois de “Confirmar alterações”. O lote conclui A11Y-011 e entrega os recortes de autenticação e perfil de A11Y-003, A11Y-009 e A11Y-014. Os demais formulários e feedbacks de clubes, livros e encontros continuam nas Semanas 10 e 11; por isso, esses três itens ainda não são encerrados globalmente.

## Escopo

| Tela | Rota | Alterações principais |
| --- | --- | --- |
| Login (T01) | `/` | instrução, `email` e `current-password`, erro da API associado aos dois campos, foco no e-mail e anúncio de envio |
| Cadastro (T02) | `/register` | instrução da senha, `name`, `email` e `new-password`, erros por campo, tratamento do e-mail já cadastrado e preservação dos valores |
| Perfil (T09) | `/profile` | instrução, `name`, limite e contador da bio, erros por campo, revisão antes do envio e anúncios de salvamento/sucesso |

## Contrato de validação e correção

Os três formulários usam rótulos com `for`/`id` e validação controlada pela aplicação. Isso evita que mensagens diferentes do navegador e da API concorram entre si.

1. o envio valida todos os campos aplicáveis sem apagar valores válidos;
2. cada campo inválido recebe `aria-invalid="true"`;
3. `aria-describedby` aponta para uma mensagem que identifica o problema e sugere a correção;
4. o foco vai ao primeiro campo que exige intervenção;
5. ao editar esse campo, seu erro antigo é removido;
6. falhas gerais da API usam `role="alert"` sem repetição contínua.

As regras compartilhadas em `frontend/src/utils/formValidation.ts` espelham os limites do backend: nome entre 2 e 80 caracteres, e-mail válido com até 120, senha de cadastro entre 6 e 80 e bio opcional com até 240 caracteres.

## Finalidade e instruções dos campos

| Campo | Token/atributo | Uso |
| --- | --- | --- |
| e-mail de login e cadastro | `autocomplete="email"`, `inputmode="email"` | identifica endereço de e-mail e favorece teclado adequado |
| senha de login | `autocomplete="current-password"` | permite preencher a credencial existente |
| senha de cadastro | `autocomplete="new-password"` | permite criar/sugerir e armazenar uma nova credencial |
| nome no cadastro e perfil | `autocomplete="name"` | identifica o nome da pessoa |
| bio | sem token | o vocabulário de `autocomplete` não possui finalidade adequada para biografia |

As instruções informam obrigatoriedade, limites e a existência da revisão. “Opcional” aparece no rótulo da bio, e o contador visível é referenciado pelo campo.

## Mensagens dinâmicas

- login anuncia “Verificando seus dados. Aguarde.” enquanto a requisição está ativa;
- cadastro anuncia “Criando sua conta. Aguarde.”;
- perfil anuncia “Salvando as alterações do perfil. Aguarde.” e, ao concluir, “Perfil atualizado.”;
- formulários ou painéis em envio expõem `aria-busy="true"` e desabilitam a ação que poderia duplicar a requisição;
- erros que exigem correção são alertas ou mensagens vinculadas ao campo, sem mover o foco para uma região distante.

## Prevenção de erro no perfil

“Revisar alterações” não persiste dados. A interface substitui temporariamente a edição por um resumo com nome e bio; o título da etapa recebe foco para anunciar a mudança de contexto. “Voltar e corrigir” preserva os valores e devolve o foco ao nome. Somente “Confirmar alterações” chama `PUT /users/me`.

Esse recorte atende a prevenção para o perfil em A11Y-014. Comentários e outras alterações persistentes ainda dependem dos lotes seguintes para que o item seja concluído em todo o produto.

## Evidências visuais

- [cadastro com erros associados](evidencias-acessibilidade/semana-09/cadastro-erros-associados.png);
- [erro de credenciais no login](evidencias-acessibilidade/semana-09/login-erro-servidor.png);
- [revisão antes de salvar o perfil](evidencias-acessibilidade/semana-09/perfil-revisao.png).

As capturas usam somente dados fictícios. A evidência programática e os passos completos estão em [semana-09-validar-formularios.mjs](semana-09-validar-formularios.mjs).

## Reteste executado

Data: 26/10/2026. Ambiente: Chrome 155 em modo headless, protocolo CDP, frontend Vite local e respostas da API simuladas sem persistência.

| Verificação | Cobertura | Resultado |
| --- | --- | --- |
| ESLint | frontend completo | aprovado, sem erros |
| TypeScript e build Vite | frontend completo | aprovado, 113 módulos transformados |
| Finalidade dos campos | nome, e-mail e senhas aplicáveis | 6/6 tokens corretos |
| Validação do cadastro vazio | nome, e-mail e senha | 3/3 erros associados; foco no nome |
| Erro do servidor no cadastro | e-mail já cadastrado | associado ao e-mail; valores preservados |
| Erro do servidor no login | credenciais inválidas | alerta, dois campos marcados e foco no e-mail |
| Estados de envio | login, cadastro e perfil | 3/3 com estado ocupado e anúncio textual |
| Revisão do perfil | revisar, voltar e confirmar | nenhuma chamada antes da confirmação; 1/1 chamada depois |
| Sucesso do perfil | retorno à edição | anunciado uma vez por região de status |
| Reflow | T01, T02 e T09 em 320 CSS px | 3/3 sem overflow horizontal |
| Regressão da Semana 7 | T01–T09 em 1280, 640 e 320 CSS px | aprovada |
| Regressão da Semana 8 | oito diálogos e dois menus | 8/8 e 2/2 aprovados |

Execução dedicada: `node docs/semana-09-validar-formularios.mjs`, com os pré-requisitos registrados no próprio arquivo.

## Rastreabilidade

| ID | Estado após a Semana 9 | Evidência |
| --- | --- | --- |
| A11Y-003 | parcial | carregamento, erros e sucesso de T01, T02 e T09 são anunciados; demais telas seguem para a Semana 11 |
| A11Y-007 | parcial | login e cadastro aprovados em 320 CSS px; zoom real de 400% permanece para a validação manual |
| A11Y-009 | parcial | erros de T01, T02 e T09 estão associados e preservam dados; demais formulários ainda serão adequados |
| A11Y-011 | concluído | todos os campos de login, cadastro e perfil com finalidade aplicável receberam o token correto |
| A11Y-014 | parcial | perfil exige revisão/confirmação; comentários e outras operações persistentes permanecem no backlog |

Critérios WCAG diretamente tratados: 1.3.5 (Identificar a finalidade de entrada), 3.3.1 (Identificação do erro), 3.3.2 (Rótulos ou instruções), 3.3.3 (Sugestão de erro), 3.3.4/3.3.6 (Prevenção de erros) e 4.1.3 (Mensagens de status).

## Checklist da Semana 9

- [x] confirmar o recorte no cronograma e no backlog;
- [x] explicitar rótulos, obrigatoriedade, limites e campos opcionais;
- [x] aplicar os seis tokens de `autocomplete` pertinentes;
- [x] associar erros aos campos com `aria-invalid` e `aria-describedby`;
- [x] focar o primeiro campo inválido e preservar valores válidos;
- [x] anunciar envio, erro e sucesso sem duplicidade;
- [x] adicionar revisão antes da atualização do perfil;
- [x] validar as três rotas em 320 CSS px;
- [x] gerar três capturas sem dados pessoais;
- [x] executar lint, build e regressões das Semanas 7 e 8;
- [x] atualizar o índice e o registro acadêmico de horas.

## Horas registradas

| Atividade | Horas |
| --- | ---: |
| Revisão do cronograma, backlog e contratos do backend | 0,5 h |
| Implementação de instruções, finalidade e validação dos três formulários | 2,0 h |
| Revisão e confirmação acessível do perfil | 1,0 h |
| Roteiro automatizado, regressões e correções | 1,0 h |
| Capturas, documentação e registro acadêmico | 0,5 h |
| **Total** | **5,0 h** |

O registro acadêmico agora totaliza 39 horas propostas executadas, incluindo 15 horas na etapa “Execução da intervenção”. A coluna “Horas Aceitas” permanece reservada ao professor.

## Limites desta execução

O roteiro confirma relações no DOM, foco, estados, quantidade de chamadas e reflow no Chromium. Ele não substitui a escuta das mensagens com NVDA, o zoom real de 400% nem a validação com pessoas, previstos para a Semana 13. As respostas de autenticação e perfil foram simuladas; a persistência real do backend não foi alterada por este teste.
