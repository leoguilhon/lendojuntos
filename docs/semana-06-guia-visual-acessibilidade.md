# Semana 6 — guia visual de acessibilidade

## Princípios

1. A hierarquia deve continuar compreensível sem cor, sombra ou animação.
2. Texto, controles e foco usam contraste medido contra o fundo real.
3. Estados possuem rótulo ou nome acessível, não apenas ícone ou mudança cromática.
4. A ordem visual acompanha o DOM e se torna uma coluna única em largura estreita.
5. Tipografia, espaçamento e componentes usam unidades relativas para tolerar zoom e preferências do usuário.
6. Movimento é decorativo e removível; nenhuma informação depende dele.

## Paleta e contraste

As razões foram calculadas com a fórmula de luminância relativa da WCAG. Os valores orientam o protótipo; a implementação deve medir novamente cada combinação no navegador.

| Token | Valor | Uso | Fundo de referência | Razão |
| --- | --- | --- | --- | ---: |
| `--color-text` | `#1c2521` | texto principal | `#fffdf9` | 15,47:1 |
| `--color-text-muted` | `#4b5a53` | texto secundário | `#fffdf9` | 7,16:1 |
| `--color-brand` | `#174c3c` | links e texto de marca | `#fffdf9` | 9,68:1 |
| branco | `#ffffff` | texto em botão primário | `#174c3c` | 9,83:1 |
| `--color-accent` | `#9b3f16` | destaque textual | `#fffdf9` | 6,63:1 |
| branco | `#ffffff` | texto em ação acentuada | `#9b3f16` | 6,74:1 |
| `--color-danger` | `#a52a20` | erro e ação destrutiva | `#fffdf9` | 7,00:1 |
| `--color-danger` | `#a52a20` | erro sobre fundo de erro | `#fce8e6` | 6,04:1 |
| `--color-focus` | `#005fcc` | indicador de foco | `#fffdf9` | 5,89:1 |
| `--color-focus` | `#005fcc` | indicador de foco | `#f7f3ed` | 5,41:1 |
| `--color-border` | `#82756a` | limite de campos/painéis | `#fffdf9` | 4,40:1 |
| `--color-brand` | `#174c3c` | texto de sucesso | `#e4f2e9` | 8,51:1 |
| `--color-text` | `#1c2521` | estado selecionado | `#fff1c7` | 13,97:1 |

Metas mínimas adotadas:

- texto comum: 4,5:1;
- texto grande: 3:1;
- limites e estados essenciais de componentes: 3:1;
- indicador de foco: 3:1 em relação à área adjacente;
- logotipo e elementos puramente decorativos não são usados para transmitir conteúdo essencial.

## Tipografia

| Elemento | Especificação |
| --- | --- |
| Família | pilha de sistema: Inter quando disponível, `ui-sans-serif`, fontes do sistema e `sans-serif` |
| Texto-base | `1rem` (normalmente 16 px), altura de linha 1,6 |
| `h1` | `clamp(2rem, 5vw, 3.5rem)`, altura 1,2 |
| `h2` | `clamp(1.4rem, 3vw, 2rem)`, altura 1,2 |
| `h3` | `1.15rem`, altura 1,2 |
| Texto auxiliar | `0.9rem`, sempre com contraste de texto comum |
| Rótulos e botões | peso 800, sem depender de caixa alta para compreensão |
| Comprimento | textos introdutórios limitados a aproximadamente 68 caracteres |

Não há bloqueio de zoom, fontes externas obrigatórias nem texto transformado em imagem.

## Espaçamento, forma e alvos

Escala-base: 4, 8, 12, 16, 24, 32 e 48 px equivalentes, implementados em `rem`. Raios: 8, 14 e 20 px equivalentes. Sombras indicam elevação, mas bordas continuam delimitando o componente sem sombra.

Controles interativos possuem altura mínima de 44 px. A separação entre controles evita acionamento acidental e permanece visível em zoom. Texto e ações quebram linha; `min-width` rígida não é aplicada ao documento.

## Foco

O padrão é um contorno externo de 3 px em `#005fcc`, deslocado 3 px, acompanhado por halo de 2 px na cor da superfície. Ele aparece somente em `:focus-visible`, não é removido em hover/ativo e se aplica a links, botões, campos, `summary` e controles personalizados.

Em `forced-colors`, o contorno usa a cor de sistema `Highlight` e a sombra é retirada. O foco programático de `h1`/`main` com `tabindex="-1"` não recebe decoração persistente depois da mudança de contexto.

## Componentes e estados

| Componente | Padrão | Estado adicional |
| --- | --- | --- |
| Link | sublinhado com espessura e afastamento perceptíveis | hover muda cor sem remover sublinhado |
| Botão primário | fundo verde escuro, borda e texto branco | ocupado mantém nome ou acrescenta “Salvando...” |
| Botão secundário | fundo claro, borda e texto verde | pressionado usa texto atualizado + `aria-pressed` |
| Botão destrutivo | fundo vermelho escuro e verbo/objeto explícitos | confirmação apresenta consequência e Cancelar primeiro |
| Campo | borda de 2 px, rótulo acima e área mínima de 44 px | erro combina borda, fundo, texto e relação programática |
| Cartão | superfície, borda e título-link | ações ficam fora do link e têm nome contextual |
| Tag | borda, texto e marcador `•` | situação sempre escrita; cor apenas reforça |
| Status | texto em região viva com fundo e borda | erro não se repete e não desaparece antes da leitura |
| Menu | acionador textual + indicador de abertura | aberto/recolhido programático; `Escape` fecha |
| Diálogo | superfície central, fundo escurecido e título | fundo inerte; foco inicial e retorno definidos |

## Reflow e zoom

| Condição | Comportamento |
| --- | --- |
| acima de 896 px | cabeçalho em três áreas; grids de duas ou três colunas |
| até 896 px | cabeçalho, autenticação e grids principais passam a uma coluna |
| até 640 px | títulos, cartões e cabeçalhos de seção passam a bloco; métricas em uma coluna |
| 320 CSS px | margem útil de 8 px; conteúdo, menu e ações ocupam a largura disponível sem rolagem horizontal |
| 200%/400% | mesma regra de reflow; nenhuma ação depende de posição lateral fixa |

Diálogos usam `min(38rem, 100% - 2rem)` e altura limitada à viewport com rolagem interna. Menus deixam de ser sobrepostos e entram no fluxo na menor faixa, evitando corte lateral.

## Cor, movimento e preferências do sistema

- `prefers-reduced-motion: reduce` elimina rolagem suave e reduz transições ao mínimo técnico;
- `forced-colors: active` preserva foco, bordas e marcadores de estado com cores do sistema;
- sucesso, erro, atual, pressionado, desabilitado e destrutivo possuem texto ou estado programático;
- nenhum emoji é usado como único nome de controle;
- gradientes e sombras são decorativos e podem desaparecer sem perda de conteúdo.

## Aplicação no produto

Os tokens do protótipo não devem ser copiados parcialmente sobre os tokens antigos. A Semana 7 deve introduzir a escala como conjunto coerente, medir os usos reais e registrar antes/depois. Exceções precisam identificar fundo, tamanho/peso do texto, razão calculada e motivo.
