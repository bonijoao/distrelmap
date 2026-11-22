# Mapa das Distribuições

[![Testes, site e APK](https://github.com/bonijoao/distrelmap/actions/workflows/ci.yml/badge.svg)](https://github.com/bonijoao/distrelmap/actions/workflows/ci.yml)

**🌐 Site: <https://bonijoao.github.io/distrelmap/>** · **📱 Android: [baixar APK](https://github.com/bonijoao/distrelmap/releases/download/apk/mapa-das-distribuicoes.apk)**

Mapa interativo das relações entre distribuições de probabilidade, com uma
calculadora para cada distribuição.

- **Mapa:** cada nó é uma distribuição e cada seta uma relação. São quatro tipos:
  caso particular, transformação, limite/aproximação e priori conjugada. Toque
  num nó para ver de onde ele vem e para onde leva; toque numa seta para ver o
  enunciado da relação. Há busca por nome ou uso, filtros e zoom.
- **Distribuições:** cada uma tem uma aba com calculadora (P dado x ou x dado P,
  sempre o último campo editado manda), gráfico com a região sombreada e uma
  ficha com fórmulas, momentos, usos e relações.

## Tecnologia

React + TypeScript (Vite), [Cytoscape.js](https://js.cytoscape.org/) para o
grafo, [stdlib](https://stdlib.io/) para as funções de distribuição e
[KaTeX](https://katex.org/) para as fórmulas. O app Android é o mesmo código
empacotado com [Capacitor](https://capacitorjs.com/) e funciona offline.

## Estrutura

```
src/
├── data/
│   ├── distributions/   # UM ARQUIVO POR DISTRIBUIÇÃO (parâmetros, funções,
│   │                    #   fórmulas, textos e as relações que saem dela)
│   └── index.ts         # registro automático + tipos de relação e grupos
├── lib/                 # cálculo e formatação genéricos
├── components/          # mapa, painel, calculadora, gráfico
└── __tests__/           # testes de contrato e de cálculo
```

### Adicionar uma distribuição

Crie `src/data/distributions/<id>.ts` seguindo um arquivo parecido (o contrato
está em `src/lib/types.ts`). Ela entra sozinha no mapa, na lista e ganha sua
aba. As relações ficam no arquivo da distribuição **de origem**, no campo
`relations`.

Os testes (`npm test`) conferem automaticamente toda distribuição:
- o quantil inverte a acumulada e a densidade é coerente com ela;
- média e variância batem com integração numérica;
- toda seta aponta para uma distribuição existente;
- **todo caso particular é verificado numericamente**, isto é, os parâmetros
  declarados em `check` geram de fato a mesma distribuição.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local
npm test         # testes
npm run build    # site em dist/
```

O GitHub Actions roda os testes, publica o site no GitHub Pages e gera o APK
(release `apk`) a cada push na `main`.

## Referências

As relações seguem a literatura clássica, em especial Leemis, L. M. &
McQueston, J. T. (2008), *Univariate Distribution Relationships*, The American
Statistician 62(1), 45–53.

## Licença

[MIT](LICENSE)
