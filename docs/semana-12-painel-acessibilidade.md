# Semana 12 — painel global de acessibilidade e divulgação

## Escopo

O lote de 09/11 a 15/11/2026 incorpora a revisão registrada no [aditivo ao cronograma](cronograma-acessibilidade-revisado.md). A principal entrega é um painel persistente que acompanha T01–T09 e permite personalizar a apresentação sem autenticação, alteração de conta ou chamada ao backend.

## Implementação

- `AccessibilityProvider` centraliza preferências, valida valores recuperados e sincroniza atributos e propriedades CSS no elemento raiz;
- `AccessibilityMenu` oferece um painel não modal com foco inicial no título, fechamento por botão ou `Escape` e retorno ao acionador;
- tamanho de fonte, brilho e contraste têm limites explícitos e controles de aumentar/diminuir;
- perfis para protanopia, deuteranopia e tritanopia trocam os principais tokens da paleta, enquanto tons de cinza aplica filtro à camada visual;
- espaçamento confortável, sublinhado de links, redução de movimento e fonte simples podem ser ligados independentemente;
- preferências são gravadas em `localStorage` sob `lendojuntos:accessibility-preferences` e podem ser restauradas em uma única ação;
- rotas públicas e autenticadas ficam dentro da camada visual ajustável, enquanto o painel permanece fora dela para continuar legível e operável.

## Contrato acessível

- acionador com `aria-haspopup="dialog"` e estado aberto/fechado em `aria-expanded`;
- painel nomeado e descrito programaticamente;
- grupos de exibição, cores e leitura identificados por `fieldset` e `legend`;
- botões de incremento com nomes contextuais e estados desabilitados nos limites;
- seleção e caixas de marcação com rótulos explícitos;
- região de status educada para anunciar cada alteração;
- alvos de interação com pelo menos 44 CSS px;
- layout com altura limitada e rolagem própria em viewport reduzido.

## Divulgação e comparação

O [guia de recursos acessíveis](guia-recursos-acessiveis.md) explica o painel, os recursos já existentes e as limitações. Em comparação à linha de base da Semana 3, o produto passa a oferecer personalização persistente de apresentação além das correções estruturais, de teclado, formulários, estados e prevenção de erro concluídas nas Semanas 7–11.

A apresentação ao clube e o registro de feedback real foram deslocados para a Semana 13, após a conclusão desta versão. Nenhum depoimento ou resultado com participantes foi presumido nesta entrega.

## Validação reproduzível

```powershell
cd frontend
npm run validate:week12
```

A regressão da Semana 12 abre o painel no login, verifica a análise axe no estado aberto, altera preferências de todos os grupos, fecha por `Escape`, confirma persistência após recarregamento, navega para uma rota autenticada e restaura o padrão.

### Resultado de 13/11/2026

| Verificação | Resultado |
| --- | --- |
| ESLint | aprovado |
| TypeScript + build Vite | aprovado, 126 módulos transformados |
| Playwright + axe | 11/11 testes aprovados; zero violação nas telas, sobreposições e painel cobertos |
| Lighthouse — login | 100 em acessibilidade; 10 itens manuais preservados para revisão |
| Lighthouse — cadastro | 100 em acessibilidade; 10 itens manuais preservados para revisão |
| Inspeção visual | painel conferido em 1440 × 1000 e 320 × 720 CSS px, com rolagem própria na viewport estreita |

O axe manteve apenas `color-contrast` como inconclusivo nos estados que combinam gradientes e transparências. Não houve nó reprovado nem exceção de regra. A aferição visual nos perfis ajustados e em alto contraste real permanece na Semana 13.

## Pendências deliberadas

- escuta real dos anúncios e da ordem de leitura com NVDA;
- zoom real em 200% e 400%, inclusive com painel aberto;
- avaliação em alto contraste do Windows e modo de cores forçadas;
- teste com participantes do clube e registro de feedback;
- correção de eventuais achados e consolidação do backlog residual.

Esses itens permanecem na Semana 13 e não devem ser substituídos pelos resultados automáticos.
