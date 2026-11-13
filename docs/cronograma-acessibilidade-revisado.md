# Aditivo ao cronograma de acessibilidade — Semanas 12 a 14

## Motivo da revisão

Em 13/11/2026, o cronograma restante foi ajustado para incorporar um painel global de acessibilidade solicitado durante o andamento do projeto. O documento acadêmico original permanece preservado em `docs/academico/` como linha de base; este aditivo registra a mudança de escopo, datas, horas e evidências esperadas sem reescrever o histórico das Semanas 1 a 11.

A carga restante permanece em 12 horas e a carga total planejada permanece em 60 horas.

## Cronograma revisado

| Semana e período | Atividades revisadas | Entregável / evidência | Horas |
| --- | --- | --- | ---: |
| Semana 12 — 09/11 a 15/11 | Implementar painel persistente em todas as páginas; oferecer tamanho de fonte, brilho, contraste, perfis de cores, espaçamento, sublinhado de links, fonte simples e redução de movimento; publicar guia de uso; ampliar a regressão automatizada e comparar com a linha de base | Código React/CSS, armazenamento local, teste Playwright + axe, guia de recursos e síntese da semana | 4 h |
| Semana 13 — 16/11 a 22/11 | Testar os fluxos e o novo painel somente com teclado, NVDA, zoom de 200%/400% e alto contraste; corrigir barreiras prioritárias; apresentar a versão ao clube e registrar feedback real | Roteiro manual, registros com tecnologias assistivas, feedback do público e backlog residual | 4 h |
| Semana 14 — 23/11 a 29/11 | Consolidar o comparativo antes/depois, revisar resultados e limitações, conferir horas, organizar evidências e concluir o relatório acadêmico | Relatório final, checklist de revisão, registro de horas e pacote de evidências | 4 h |

## Critérios acrescentados

- o acionador deve permanecer disponível em T01–T09 e não depender de autenticação;
- todas as opções devem funcionar por teclado e possuir nome e estado programáticos;
- o painel deve permitir fechamento por botão e tecla `Escape`, com retorno de foco ao acionador;
- preferências devem persistir entre rotas e recarregamentos, com restauração integral do padrão;
- o painel não deve receber os filtros de brilho, contraste ou tons de cinza que ele próprio controla;
- perfis de cores são recursos auxiliares e não substituem informação textual, padrões do sistema nem validação manual;
- a validação final não deve declarar conformidade integral sem concluir os testes manuais da Semana 13.

## Mudanças em relação ao cronograma original

- a produção do guia e o comparativo automático continuam na Semana 12 e passam a documentar também o painel global;
- a apresentação ao clube foi deslocada para a Semana 13, quando a versão implementada poderá ser avaliada junto com os testes manuais;
- a consolidação do comparativo final permanece na Semana 14, junto ao relatório e ao pacote de evidências;
- nenhuma hora foi adicionada ao total planejado.
