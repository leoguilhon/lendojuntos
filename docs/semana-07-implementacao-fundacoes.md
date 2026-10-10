# Semana 7 — implementação das fundações de acessibilidade

## Resultado do lote

Entre 05/10 e 11/10/2026, o frontend recebeu as fundações globais previstas para a primeira semana de implementação. O lote cobre A11Y-002, A11Y-004, A11Y-005 e A11Y-008 e antecipa a correção de overflow simples de T01/T02 encontrada durante a regressão. Os fluxos de diálogos, formulários, cartões e estados continuam nos lotes das Semanas 8–11.

## Implementação

| Área | Antes | Depois |
| --- | --- | --- |
| Estrutura | cada página possuía `main`, mas sem destino comum | exatamente um `main#conteudo-principal` em cada rota e estado renderizado |
| Ignorar blocos | não havia link de salto | “Ir para o conteúdo principal” é o primeiro controle, aparece no foco e move foco para o `main` sem alterar a rota |
| Contexto de rota | título do documento era estático e a navegação não gerenciava foco | títulos no padrão “Tela — LendoJuntos”; navegação interna foca o `h1` com `tabindex="-1"` temporário |
| Voltar/Avançar | o foco podia cair no `body` quando o alvo saía do DOM | o foco restaurado é preservado; se não existir mais, o `h1` ou `main` recebe foco temporário |
| Navegação atual | apenas correspondência exata recebia estilo | `aria-current="page"` identifica Perfil e toda a seção Clubes, inclusive suas subrotas |
| Foco visível | contorno laranja translúcido de baixo contraste | contorno externo de 3 px em `#005fcc`, deslocamento de 3 px e halo de superfície |
| Preferências | movimento reduzido já removia animações; cores forçadas não tinham tratamento | movimento reduzido permanece sem animação/transição/rolagem suave e `forced-colors` preserva contorno e estados |
| Reflow global | `body` impunha largura mínima e o cabeçalho da autenticação expandia a grade | sem largura mínima no documento, conteúdo flexível e nenhuma rolagem horizontal nas nove rotas a 320 CSS px |

O componente compartilhado `RouteAccessibility.tsx` concentra título, foco de rota e link de salto. A ordem do DOM do cabeçalho foi preservada: marca, navegação, identificação do usuário e saída.

## Comparativo de contraste

As razões abaixo usam a fórmula de luminância relativa da WCAG e o fundo de referência `#fffdf9`. No foco anterior, a cor efetiva `#f4e1d5` resulta da composição de `#c67143` a 20% sobre o fundo.

| Uso | Antes | Razão | Depois | Razão | Meta |
| --- | --- | ---: | --- | ---: | ---: |
| Texto auxiliar | `#7b8078` | 3,97:1 | `#4b5a53` | 7,16:1 | 4,5:1 |
| Destaque textual | `#c67143` | 3,54:1 | `#9b3f16` | 6,63:1 | 4,5:1 |
| Marca e links | `#2d473e` | 9,93:1 | `#174c3c` | 9,68:1 | 4,5:1 |
| Limite de campo | `#d8ccbc` | 1,56:1 | `#82756a` | 4,40:1 | 3:1 |
| Texto destrutivo | `#a64030` | 6,08:1 | `#a52a20` | 7,00:1 | 4,5:1 |
| Indicador de foco | `#f4e1d5` | 1,25:1 | `#005fcc` | 5,89:1 | 3:1 |

Os valores de marca continuam conformes; a troca nesse caso alinha a interface à escala coerente definida no guia visual. Cores translúcidas remanescentes são decorativas e não carregam texto ou estado essencial sozinhas.

## Reteste executado

Data: 10/10/2026. Ambiente: Chrome 154 em modo headless, protocolo CDP, frontend Vite local e respostas de leitura da API simuladas sem persistência.

| Verificação | Cobertura | Resultado |
| --- | --- | --- |
| ESLint | frontend completo | aprovado, sem erros |
| TypeScript e build Vite | frontend completo | aprovado, 112 módulos transformados |
| Título, `h1`, `main` e rota atual | T01–T09 | 9/9 aprovadas |
| Link de salto por teclado | primeiro `Tab` e `Enter` | visível, contorno de 3 px e foco em `main#conteudo-principal` |
| Mudança de rota | Dashboard → Perfil | foco no `h1`, `tabindex="-1"` removido ao sair |
| Histórico | Perfil → Voltar | retorno ao Dashboard sem foco no `body` |
| Estado de erro sem `h1` | Dashboard → clube com falha simulada | fallback de foco em `main#conteudo-principal` |
| Reflow | T01–T09 em 1280, 640 e 320 CSS px | 27/27 combinações sem overflow horizontal |
| Movimento reduzido | Dashboard | animação `none`, transição `0s` e rolagem `auto` |
| Cores forçadas | navegação autenticada | contorno sólido de 3 px e sombra removida |

Roteiro reproduzível: `node docs/semana-07-validar-fundacoes.mjs`, com os pré-requisitos descritos no próprio arquivo.

## Checklist da Semana 7

- [x] revisar o backlog e o handoff da Semana 6;
- [x] garantir landmark principal e destino único em T01–T09;
- [x] implementar e testar o link de salto;
- [x] definir título do documento por rota;
- [x] gerenciar foco em navegação interna e histórico;
- [x] expor a seção de navegação atual;
- [x] aplicar foco global com contraste medido;
- [x] substituir os tokens de texto, marca, destaque, borda e perigo como escala coerente;
- [x] preservar foco em `forced-colors` e remover movimento não essencial;
- [x] executar lint, build e regressão no navegador;
- [x] validar as nove telas em 1280, 640 e 320 CSS px;
- [x] atualizar documentação e registro de horas.

## Horas registradas

| Atividade | Horas |
| --- | ---: |
| Revisão do backlog, especificações e alcance | 0,5 h |
| Implementação das fundações globais | 2,5 h |
| Reteste, diagnóstico e correções de regressão | 1,0 h |
| Comparativo, evidências e atualização acadêmica | 1,0 h |
| **Total** | **5,0 h** |

## Limites desta execução

O reteste comprova o recorte técnico automatizável do lote, mas não substitui NVDA em sessão dedicada, zoom real de 200%/400% nem um tema real de alto contraste do Windows. Essas verificações permanecem previstas para a validação manual final. A API foi simulada porque o Docker local não estava em execução; nenhuma operação de persistência faz parte deste lote.
