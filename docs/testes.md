# Plano e execução de testes

Objetivo: verificar RF01–RF07, RNF01–RNF05 e RN01–RN05 do sistema de estoque, a partir de resultados reais.

Escopo: cadastro de usuário, login, cadastro/listagem/exclusão de produto e movimentação de entrada/saída. Telas de frontend não fazem parte destes testes de API.

Ambiente: Node.js v24.18.0; MySQL 8.0.46; servidor HTTP local na porta 49628; schema de teste senai_estoque_test_20261009013711708_6f09f9.

Estratégia: testes automáticos de sistema e integração por HTTP e consultas ao MySQL real; cenários funcionais, segurança, mensagens em português, valor limite e tempo de listagem. A coleção Postman permite reproduzir as requisições; esta execução foi realizada pelo script.

Critérios de entrada: configuração local válida, banco acessível, schema novo distinto do banco da aplicação, servidor iniciado e models sincronizados sem apagar tabelas. O próprio script prepara usuários e produtos de teste.

Critérios de saída: todos os casos executados e aprovados; nenhum defeito crítico ou alto aberto. A exigência de aprovação de todos os casos é mais estrita que o critério mínimo do material.

Responsável e momento: execução reproduzível pelo comando npm test; esta rodada começou em 2026-10-09T01:37:11.706Z e terminou em 2026-10-09T01:37:15.667Z (UTC). Fuso de referência: America/Sao_Paulo.

Pré-condições, passos e esperados foram registrados antes de executar em [casos.json](casos.json). Sua impressão SHA-256 nesta rodada é 46a61b9f5553e29d29cb7cde292b8ecc7694c9a757af21b990015952915a771d.

## Matriz de rastreabilidade

| Requisito | Descrição | Casos | Cobertura |
| --- | --- | --- | --- |
| RF01 | Cadastrar usuários com perfil | CT01, CT02, CT03, CT04 | Coberto |
| RF02 | Realizar login | CT05, CT06 | Coberto |
| RF03 | Cadastrar produtos | CT08, CT09 | Coberto |
| RF04 | Listar produtos com paginação e filtros | CT10, CT11, CT12, CT13 | Coberto |
| RF05 | Excluir produtos | CT14, CT15 | Coberto |
| RF06 | Registrar entradas e saídas | CT16, CT17, CT18, CT19, CT20, CT21, CT22 | Coberto |
| RF07 | Registrar responsável pela movimentação | CT16, CT17 | Coberto |
| RNF01 | Senhas armazenadas com hash | CT01 | Coberto |
| RNF02 | Rotas protegidas por token | CT05, CT07 | Coberto |
| RNF03 | Listagem em até dois segundos | CT10 | Coberto |
| RNF04 | Mensagens de erro em português | CT01, CT03, CT04, CT06, CT07, CT09, CT13, CT15, CT18, CT19, CT20, CT21 | Coberto |
| RNF05 | Node.js, Express, Sequelize e MySQL | CT10 | Coberto |
| RN01 | Apenas administrador exclui produtos | CT14, CT15 | Coberto |
| RN02 | Toda movimentação tem responsável | CT16, CT17, CT21 | Coberto |
| RN03 | Movimentação é entrada ou saída | CT16, CT17, CT20 | Coberto |
| RN04 | Quantidade de movimentação inteira e maior que zero | CT19, CT22 | Coberto |
| RN05 | Saída não excede estoque disponível | CT17, CT18, CT22 | Coberto |

## Resultados reais

| Caso | Cenário | Resultado |
| --- | --- | --- |
| CT01 | Cadastrar operador e verificar proteção da senha | Passou |
| CT02 | Cadastrar administrador | Passou |
| CT03 | Recusar e-mail duplicado | Passou |
| CT04 | Recusar perfil inválido e cadastro incompleto | Passou |
| CT05 | Login dos dois perfis com token de oito horas | Passou |
| CT06 | Recusar credenciais inválidas | Passou |
| CT07 | Bloquear requisições sem token, com token inválido e expirado | Passou |
| CT08 | Cadastrar produto com estoque inicial informado | Passou |
| CT09 | Estoque padrão zero e validação do cadastro | Passou |
| CT10 | Listagem paginada, resposta em array e desempenho | Passou |
| CT11 | Filtro por trecho do nome | Passou |
| CT12 | Filtro por data de cadastro e combinação com nome | Passou |
| CT13 | Recusar paginação e data inválidas | Passou |
| CT14 | Impedir exclusão por operador | Passou |
| CT15 | Excluir por administrador e tratar id inexistente | Passou |
| CT16 | Registrar entrada e responsável do token | Passou |
| CT17 | Registrar saída e reduzir estoque | Passou |
| CT18 | Recusar saída maior que o estoque | Passou |
| CT19 | Recusar quantidade zero, negativa e fracionária | Passou |
| CT20 | Recusar tipo de movimentação inválido | Passou |
| CT21 | Recusar movimentação de produto inexistente | Passou |
| CT22 | Aceitar o valor limite de uma unidade | Passou |

Cada caso contém os dados de entrada sem segredos, respostas HTTP, duração, comparações e consultas ao banco em [evidencias/execucao.json](evidencias/execucao.json). Os resultados esperados vieram da definição prévia; não foram preenchidos a partir das respostas.

## Defeitos

| ID | Casos | Origem | Severidade | Estado |
| --- | --- | --- | --- | --- |
| DFV01 | CT04, CT09 | Verificador | Média | Fechado |

DFV01 teve origem no verificador: a heurística de idioma não reconheceu a mensagem correta “Nome deve ser preenchido”. A API havia retornado HTTP 400 em português; a aplicação não precisou ser alterada. A heurística foi corrigida para reconhecer “nome” e “preenchido”, mantendo os resultados esperados previamente definidos.

A [evidência da rodada inicial](evidencias/execucao-instrumentacao-inicial.json) foi preservada: 16 casos passaram, dois tiveram falso positivo e quatro ficaram bloqueados por dependência. O reteste e a regressão executaram novamente os 22 casos e todos passaram. Os passos, diagnóstico, correção e fechamento constam de DFV01 em [execucao.json](evidencias/execucao.json). Nenhum defeito funcional da aplicação foi identificado e nenhum defeito ficou aberto.

## Resumo

| Total | Passou | Falhou | Bloqueado | Defeitos abertos | Critério de saída |
| --- | --- | --- | --- | --- | --- |
| 22 | 22 | 0 | 0 | 0 | Atendido |

Limite da medição de desempenho: listagem local com quatro produtos; estes resultados verificam o cenário definido, sem estabelecer capacidade sob carga.

O schema isolado foi preservado para conferir os registros. O script não remove bancos ou tabelas e nunca executa testes contra DB_NAME da aplicação.
