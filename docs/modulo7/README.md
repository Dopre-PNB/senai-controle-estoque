# Módulo 7 — execução dos dez casos práticos

Entrega completa em [Word](Modulo7_Testes.docx), com plano, casos, resultados, matriz de rastreabilidade, defeito e reteste, exercícios respondidos e capturas. A [planilha de testes](../testes.xlsx) reúne os 22 casos automáticos complementares.

Os dez casos da seção 10 do PDF (pp. 8–9) foram executados na interface Postman com assistência do Codex, adaptando Livro para Produto. As conferências previstas foram feitas na interface MySQL Workbench. Todos passaram; as 14 capturas comprovam os dez envios e as quatro conferências do banco.

As requisições foram enviadas entre 09/10/2026, 00:03:03 e 09/10/2026, 00:12:52, no fuso America/Sao_Paulo, usando API local na porta 3007 e MySQL na porta 3311. A última consulta no Workbench foi registrada às 00:13:26, conforme a captura M7-CT10. O schema exclusivo foi senai_estoque_m7_20261009030134150_5906a7, com administrador, operador e três produtos fictícios preparados antes dos envios.

## Fontes e esperados prévios

- [Casos práticos](casos-praticos.json): pré-condições, passos, entrada e resultado esperado definidos antes da execução. SHA-256: 271edfd9a8bd43fc2b386c9e979db39dd9255cb24d46279b535a730e2f6de4ec.
- [Resultados consolidados](resultados-praticos.json): comparação caso a caso, dados reais, situação, mapa das capturas e fechamento.
- [Registro original da interface](evidencias-interface.json): respostas e consultas MySQL capturadas durante os envios, preservadas sem alteração. SHA-256: ed39df3a28ae860c65b72e63147ebcab36743f3ab823a9f8c855b97465aeb154.
- [Capturas do Postman e Workbench](evidencias/): dez respostas da API e quatro consultas ao banco.

O logger observou instâncias Sequelize antes da serialização HTTP. A fonte consolidada apresenta dataValues no formato equivalente a toJSON, como exibido pelo Postman; o registro original foi mantido para auditoria.

O arquivo de casos prévios conserva o estado do planejamento anterior aos testes. A situação final de cada caso está nos resultados consolidados e no quadro abaixo.

## Resultado e rastreabilidade

| Caso prático | Caso no PDF | Requisitos | Referência automática | Obtido | Situação |
| --- | --- | --- | --- | --- | --- |
| M7-CT01 | CT01 | RF02 | CT05 | HTTP 200; Token recebido (valor omitido nos registros) | Passou |
| M7-CT02 | CT02 | RF02 | CT06 | HTTP 401; Email ou senha inválidos | Passou |
| M7-CT03 | CT03 | RNF02 | CT07 | HTTP 401; Token não enviado | Passou |
| M7-CT04 | CT04 | RF03 | CT08, CT09 | HTTP 201; Registro retornado; dados confirmados no MySQL | Passou |
| M7-CT05 | CT05 | RN01 | CT14 | HTTP 403; Sem permissão para essa ação | Passou |
| M7-CT06 | CT06 | RF05 | CT15 | HTTP 200; Produto removido com sucesso | Passou |
| M7-CT07 | CT07 | RF04 | CT10 | HTTP 200; 2 produtos na resposta | Passou |
| M7-CT08 | CT08 | RF04 | CT11 | HTTP 200; 2 produtos na resposta | Passou |
| M7-CT09 | CT09 | RF06, RF07 | CT16 | HTTP 201; Registro retornado; dados confirmados no MySQL | Passou |
| M7-CT10 | CT10 | RN04 | CT19 | HTTP 400; Quantidade deve ser um número inteiro maior que zero | Passou |

M7-CT05 foi executado antes de M7-CT06: o operador recebeu 403 e preservou o produto; o administrador recebeu 200 e o removeu. O cadastro M7-CT04 criou o produto 4; a entrada M7-CT09 e a tentativa com quantidade zero M7-CT10 usaram o produto 1, preservado desde a preparação.

No banco, M7-CT09 registrou uma entrada de cinco unidades, responsável operador id 1, data preenchida e saldo 15. Após M7-CT10, o saldo continuou 15, havia somente a entrada válida e nenhuma movimentação com quantidade zero.

## Resumo e defeitos

| Total | Passou | Falhou | Bloqueado | Defeitos abertos | Capturas | Critério de saída |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 10 | 0 | 0 | 0 | 14 | Atendido |

Nenhuma divergência foi observada nos dez casos práticos. O [relatório da rodada automática](../testes.md) registra separadamente 22 casos aprovados e DFV01, defeito do verificador corrigido e fechado após reteste/regressão. Os 22 resultados automáticos não foram apresentados como envios na interface.

## Encerramento do ambiente

A API isolada foi encerrada após a última conferência. O token fictício visível na captura M7-CT01 pertence a esse ambiente encerrado; a chave local M7 foi substituída e a rejeição dos tokens anteriores pela nova chave foi verificada. O arquivo .env da aplicação não foi alterado. Detalhes sem segredos em [encerramento.json](encerramento.json).
