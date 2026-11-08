# Semana 11 — feedback, prevenção de erro e automação de acessibilidade

## Resultado

O lote previsto para 02/11 a 08/11/2026 foi concluído em 08/11/2026. As nove telas T01–T09 e os estados abertos dos oito diálogos e dois menus passaram por uma suíte reproduzível com Playwright e axe-core. Login e cadastro também obtiveram 100 pontos na categoria de acessibilidade do Lighthouse, sem auditoria binária reprovada.

Além da regressão automatizada, o lote encerra os recortes restantes de A11Y-003, A11Y-009 e A11Y-014: carregamentos, sucessos e falhas agora possuem tratamento programático consistente; os formulários restantes associam erros aos campos; e comentários de livro e encontro exigem revisão antes da chamada de persistência.

Esses resultados não constituem declaração de conformidade WCAG. Os testes com NVDA em primeiro plano, zoom real, espaçamento de texto e tema real de contraste continuam na Semana 13.

## Implementação concluída

### Feedback e carregamento

- `PageLoading` expõe a região principal como ocupada e anuncia o que está sendo carregado;
- `PageFeedback` usa `status` para conclusões não urgentes e `alert` para falhas que exigem ação;
- formulários de criação e edição mantêm falhas do servidor dentro do diálogo aberto;
- formulários e alternâncias impedem submissões duplicadas enquanto a requisição está em andamento;
- mensagens não movem o foco quando a pessoa pode continuar no controle acionado.

### Erros associados aos campos

Os campos obrigatórios restantes de clube, livro e encontro agora usam:

- rótulo explícito e ID estável;
- `aria-invalid` somente no estado inválido;
- `aria-describedby` apontando para a mensagem ativa;
- mensagem específica com orientação de correção;
- foco no primeiro campo inválido depois da tentativa de envio;
- preservação dos demais valores preenchidos.

Os formulários de login, cadastro e perfil já possuíam esse contrato desde a Semana 9. Assim, T01–T09 ficam cobertas pelo mesmo padrão.

### Revisão de comentários

O componente compartilhado `CommentComposer` foi aplicado ao livro e ao encontro. O primeiro envio apenas abre a revisão e move o foco para seu título. A API só é chamada após “Confirmar publicação”. “Voltar e editar” preserva integralmente o texto, e falhas de publicação permanecem no painel de revisão como alerta.

Essa etapa completa a proteção prevista para comentários em A11Y-014. Perfil continua com revisão; criação e edição preservam os dados para correção; exclusões e saída do clube continuam em diálogos de confirmação com objeto e consequência explícitos.

## Automação incorporada

Versões fixadas no `package-lock.json`:

| Ferramenta | Versão usada | Papel |
| --- | ---: | --- |
| Playwright Test | 1.65.0 | rotas, teclado, estados autenticados, diálogos e menus |
| `@axe-core/playwright` / axe-core | 4.14.0 | regras WCAG 2.0, 2.1 e 2.2 A/AA automatizáveis |
| Lighthouse | 12.8.2 | verificação complementar e lista de auditorias manuais |
| Chrome | 157.0.8103.38 | navegador Chromium local em modo headless |

A suíte usa respostas de API fictícias interceptadas no navegador. Nenhum token real é gravado, nenhum dado é persistido e a execução é determinística. Movimento reduzido é ativado para evitar que uma medição de contraste ocorra no meio de uma animação de entrada.

### Cobertura

| Grupo | Estados verificados |
| --- | --- |
| T01–T02 | login e cadastro |
| T03–T09 | dashboard, clube, livros, livro, encontros, encontro e perfil |
| Oito diálogos | criar/editar/excluir/sair de clube; cadastrar livro; criar/editar/apagar encontro |
| Dois menus | ações do clube e ações do encontro |
| A11Y-009 | tentativa inválida, foco, `aria-invalid` e erro descrito no diálogo de clube |
| A11Y-014 | revisão e confirmação de comentário antes da requisição |

Cada análise axe falha o teste quando encontra uma violação e anexa violações e itens `incomplete` ao relatório HTML do Playwright. Não há desativação global de regras.

## Resultados de 08/11/2026

| Porta | Resultado |
| --- | --- |
| ESLint | aprovado |
| TypeScript + build Vite | aprovado, 124 módulos transformados |
| Playwright + axe | 10/10 testes aprovados; zero violação nas telas e estados cobertos |
| Lighthouse — login | 100; zero auditoria binária reprovada; 10 verificações manuais listadas |
| Lighthouse — cadastro | 100; zero auditoria binária reprovada; 10 verificações manuais listadas |
| dependências de produção | `npm audit --omit=dev`: zero vulnerabilidade conhecida |

Execução completa:

```powershell
cd frontend
npm run validate:week11
```

Execuções separadas:

```powershell
npm run test:a11y
npm run test:a11y:lighthouse
```

Relatórios temporários são gerados em `frontend/playwright-report` e `frontend/test-results`; ambos estão ignorados pelo Git para não versionar traces, estado local ou artefatos volumosos.

## Revisão dos itens inconclusivos

O axe marcou `color-contrast` como inconclusivo quando o fundo efetivo resulta de gradientes e transparências. Não houve nó reprovado. A revisão considerou os tokens e razões já medidos na Semana 7, o estado renderizado, os resultados binários do Lighthouse e o uso de cores forçadas coberto pelos roteiros anteriores. Não foi criada exceção de regra; contraste real do Windows e inspeção com zoom permanecem em VAL-002.

Antes da correção dos ícones, o axe também pediu revisão de `label-content-name-mismatch` nos botões de favorito, curtida e fechamento de diálogo. Os glifos decorativos `★`, `☆`, `♥`, `♡` e `×` deixaram de ser conteúdo textual do controle, mantendo no botão somente o nome contextual e, nas alternâncias, o estado `aria-pressed`. A nova execução deixou somente a revisão de contraste descrita acima.

As dez auditorias manuais do Lighthouse — entre elas ordem de foco, foco gerenciado, rótulos de controles personalizados, landmarks e correspondência entre ordem visual e DOM — foram cruzadas com a semântica do código e com as regressões das Semanas 7–10. Elas não foram convertidas artificialmente em aprovação automática. Escuta com NVDA e validação visual real continuam explicitamente pendentes para a Semana 13.

## Rastreabilidade do backlog

| ID | Estado após a Semana 11 | Evidência |
| --- | --- | --- |
| A11Y-003 | concluído no recorte T01–T09 | status/alerta, carregamento ocupado, mensagens únicas e testes de estados |
| A11Y-009 | concluído no recorte T01–T09 | erros associados e foco de correção nos formulários restantes |
| A11Y-014 | concluído | revisão de perfil/comentários, preservação de formulários e confirmações destrutivas |
| A11Y-001–002, 004–008, 010–013 | regressão aprovada | rotas e estados representativos sem violação axe |
| VAL-001 | pendente | execução completa com NVDA na Semana 13 |
| VAL-002 | pendente | zoom, espaçamento e contraste real na Semana 13 |

## Limites

- axe e Lighthouse avaliam somente o subconjunto automatizável dos critérios;
- as respostas da API são simuladas e não validam disponibilidade do backend;
- Playwright confirma comportamento observável no Chromium, mas não a qualidade da fala do leitor de tela;
- pontuação 100 do Lighthouse não equivale a conformidade integral;
- artefatos temporários podem ser regenerados pelos comandos acima e não substituem a síntese rastreável deste documento.
