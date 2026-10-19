# Semana 8 — diálogos e menus de ações acessíveis

## Resultado do lote

Entre 12/10 e 18/10/2026, as sobreposições compartilhadas do frontend foram adequadas ao contrato acessível definido nas Semanas 5 e 6. O lote conclui A11Y-001, A11Y-012 e A11Y-013: os oito diálogos agora têm nome, modalidade, foco inicial, contenção e retorno de foco; os dois menus de ações têm acionador contextual e fechamento previsível; e o fundo do diálogo só fecha após clique concluído nele próprio.

Formulários, mensagens dinâmicas e prevenção de erro permanecem nos lotes das Semanas 9–11. A validação dedicada com NVDA continua prevista para a Semana 13.

## Implementação do diálogo compartilhado

O `Modal.tsx` passou a usar o elemento `dialog` aberto por `showModal()`. A modalidade nativa retira o conteúdo de fundo da navegação sequencial e da árvore de interação enquanto a sobreposição está aberta. O componente mantém uma contenção explícita como proteção adicional nos limites de `Tab` e `Shift+Tab`.

| Requisito | Antes | Depois |
| --- | --- | --- |
| Nome acessível | título visível sem associação | `aria-labelledby` referencia o `h2` com ID único; `aria-modal="true"` explicita o estado |
| Modalidade | `section role="dialog"` sobre conteúdo ainda operável | `dialog.showModal()` coloca a sobreposição na camada modal e torna o fundo inerte |
| Foco inicial | permanecia no acionador | primeiro campo em formulários; Cancelar em confirmações destrutivas |
| Contenção | `Tab` podia alcançar a página | último controle avança para o primeiro; primeiro recua para o último |
| Saídas | `Escape`, botão Fechar e fundo | `Escape`, Fechar, Cancelar e clique concluído no fundo fecham sem ação principal |
| Retorno | não implementado | foco retorna ao acionador ainda existente; ações vindas de menu retornam ao botão do menu |
| Ponteiro | `mousedown` no fundo fechava imediatamente | pressionar não fecha; clique interno não fecha; apenas clique concluído no próprio fundo fecha |
| Reflow | quadro limitado, sem modalidade nativa | quadro e camada respeitam viewport e rolagem interna sem overflow horizontal |

O botão de fechar recebeu nome contextual, por exemplo “Fechar editar clube”, enquanto o símbolo visual `×` ficou oculto da árvore acessível.

## Oito variações cobertas

| Tela | Diálogo | Foco inicial | Retorno esperado |
| --- | --- | --- | --- |
| Dashboard | Criar clube | Nome do clube | Criar clube |
| Clube | Editar clube | Título | Ações do clube |
| Clube | Excluir clube | Cancelar | Ações do clube |
| Clube | Sair do clube | Cancelar | Sair do clube |
| Livros | Cadastrar livro | Título | Cadastrar livro |
| Encontros | Criar encontro | Título | Criar encontro |
| Encontro | Editar encontro | Título | Ações do encontro |
| Encontro | Apagar encontro | Cancelar | Ações do encontro |

O atributo de implementação `data-modal-initial-focus` marca somente a ação segura das três confirmações destrutivas. Nas demais variações, o componente encontra o primeiro campo habilitado. Isso preserva um contrato único sem acoplar o componente aos formulários das páginas.

## Implementação dos menus de ações

`ActionMenu.tsx` deixou de usar um `summary` identificado apenas por emoji e passou a expor um botão controlado por estado.

- “Ações do clube” e “Ações do encontro” fornecem nomes textuais e contextuais;
- `aria-expanded` comunica aberto/fechado e `aria-controls` liga o acionador ao painel;
- o atributo `hidden` remove as opções da ordem de foco e da árvore acessível enquanto fechado;
- `Escape` fecha e devolve o foco ao acionador;
- clique concluído fora fecha o painel;
- ao escolher uma ação, o menu fecha e foca seu acionador antes da abertura do diálogo, criando um destino estável para o retorno;
- em 320 CSS px, acionador e painel ocupam a largura disponível sem ultrapassar a viewport.

## Roteiro de teste de teclado

Pré-condição: entrar com um usuário administrador para os menus e diálogos de edição/exclusão; usar um membro que não seja criador para “Sair do clube”.

Para cada uma das oito variações:

1. alcançar o acionador com `Tab` e abrir com `Enter` ou `Espaço`;
2. confirmar o nome do diálogo e o foco no primeiro campo ou em Cancelar, conforme a tabela;
3. percorrer todos os controles com `Tab` e confirmar que o último retorna ao primeiro;
4. usar `Shift+Tab` no primeiro e confirmar que o foco retorna ao último;
5. pressionar `Escape` e confirmar fechamento sem envio e retorno ao acionador;
6. repetir e fechar por Fechar e Cancelar;
7. repetir com ponteiro: pressionar no fundo sem concluir não fecha, clicar dentro não fecha e clicar no próprio fundo fecha.

Para cada um dos dois menus:

1. confirmar nome contextual e estado recolhido;
2. abrir com `Enter` ou `Espaço` e confirmar `aria-expanded="true"`;
3. navegar pelas ações e pressionar `Escape`, verificando fechamento e foco no acionador;
4. reabrir e clicar fora, verificando fechamento sem disparar uma opção;
5. escolher Editar ou Excluir/Apagar e confirmar que o menu fecha antes do diálogo.

Execução automatizada equivalente: `node docs/semana-08-validar-sobreposicoes.mjs`, com os pré-requisitos descritos no próprio arquivo.

## Reteste executado

Data: 18/10/2026. Ambiente: Chrome 155 em modo headless, protocolo CDP, frontend Vite local e respostas de leitura da API simuladas sem persistência.

| Verificação | Cobertura | Resultado |
| --- | --- | --- |
| ESLint | frontend completo | aprovado, sem erros |
| TypeScript e build Vite | frontend completo | aprovado, 112 módulos transformados |
| Nome, modalidade e foco inicial | oito diálogos | 8/8 aprovados |
| `Tab` e `Shift+Tab` | limites de foco dos oito diálogos | 16/16 ciclos contidos |
| Fundo inerte | tentativa de foco no `h1` com cada diálogo aberto | 8/8 bloqueadas |
| `Escape` e retorno | oito diálogos | 8/8 fecharam e retornaram ao destino esperado |
| Estado, `Escape` e clique externo | menu do clube e do encontro | 2/2 aprovados |
| Cancelamento de ponteiro | pressionar fundo, clicar dentro e clicar no fundo | 3/3 comportamentos aprovados |
| Reflow das sobreposições | diálogo e menu abertos em 320 CSS px | sem overflow horizontal |
| Regressão da Semana 7 | T01–T09 em 1280, 640 e 320 CSS px | 27/27 combinações sem overflow; roteiro aprovado |

## Checklist da Semana 8

- [x] revisar A11Y-001, A11Y-012 e A11Y-013 no backlog e no handoff;
- [x] associar o título visível ao nome dos oito diálogos;
- [x] aplicar modalidade nativa e fundo inerte;
- [x] definir foco inicial por tipo de diálogo;
- [x] conter `Tab` e `Shift+Tab`;
- [x] fechar por `Escape`, Fechar, Cancelar e clique concluído no fundo;
- [x] devolver o foco ao acionador ou ao botão de menu sobrevivente;
- [x] substituir acionadores de menu por nomes textuais contextuais;
- [x] expor estado expandido e remover opções fechadas da ordem de foco;
- [x] fechar menus por `Escape`, clique externo e escolha de ação;
- [x] validar diálogo e menu em 320 CSS px;
- [x] executar lint, build, roteiro dedicado e regressão da Semana 7;
- [x] atualizar documentação, índice e registro acadêmico de horas.

## Horas registradas

| Atividade | Horas |
| --- | ---: |
| Revisão do backlog, wireframes e contrato técnico | 0,5 h |
| Implementação do diálogo compartilhado e oito variações | 2,0 h |
| Implementação dos dois menus de ações | 1,0 h |
| Roteiro automatizado, regressão e correções | 1,0 h |
| Evidências e atualização acadêmica | 0,5 h |
| **Total** | **5,0 h** |

## Limites desta execução

O roteiro cobre o comportamento de teclado no Chromium, a modalidade nativa e as relações no DOM. Ele não substitui a leitura dos nomes e estados em sessão dedicada com NVDA, prevista para a validação manual final. As respostas da API foram simuladas porque persistência não faz parte deste lote; nenhuma ação principal de criação, edição ou exclusão foi enviada durante o teste.
