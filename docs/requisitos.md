# Requisitos e modelagem

Domínio: almoxarifado de produtos. O módulo 6, p. 5, solicita aplicar os conceitos a um domínio diferente da biblioteca. Esta lista adapta as entidades e operações dos módulos 2–5 sem acrescentar funcionalidades.

## Modelo

| Entidade | Atributos |
|---|---|
| Usuario | id, nome, email único, senha com hash bcrypt, tipo (`administrador` ou `operador`), createdAt, updatedAt. |
| Produto | id, nome, descricao, quantidade_estoque inteira não negativa com padrão zero, createdAt, updatedAt. |
| Movimentacao | id, produto_id, usuario_id, tipo (`entrada` ou `saida`), quantidade inteira positiva, data automática, createdAt, updatedAt. |

Um Usuario registra várias Movimentacoes. Um Produto recebe várias Movimentacoes. No cadastro de uma movimentação, o produto deve existir e o usuário é identificado pelo token. A relação do produto usa `SET NULL` na exclusão; nesse caso a movimentação existente permanece com `produto_id` nulo. O saldo inicial é salvo diretamente no cadastro do produto, como no exemplo do módulo 4, p. 3.

Referências: M2, p. 2; M3, p. 3; M4, pp. 1–3; M5, pp. 3–5.

## Requisitos funcionais

| Código | Requisito testável | Referência |
|---|---|---|
| RF01 | O sistema deve permitir o cadastro público de usuários com nome, email, senha e perfil administrador ou operador, retornando 201 sem senha/hash. | M3, pp. 4–6; M6, p. 2. |
| RF02 | O sistema deve permitir login com email e senha, retornando 200 com token quando válidos e 401 quando inválidos. | M3, pp. 6–8; M7, p. 8. |
| RF03 | O sistema deve permitir ao usuário autenticado cadastrar produtos com nome, descrição e saldo inicial opcional, retornando 201 e usando zero quando o saldo não for informado. | M4, pp. 2–4. |
| RF04 | O sistema deve permitir ao usuário autenticado listar produtos em um array com paginação e filtros opcionais de nome/data. Página e limite padrão: 1 e 10; nome contém o texto e createdAt é maior ou igual à data. | M5, pp. 1–2. |
| RF05 | O sistema deve permitir ao administrador autenticado excluir produto por ID, retornando 200 quando existente e 404 quando inexistente. | M5, pp. 4–5. |
| RF06 | O sistema deve permitir ao usuário autenticado registrar movimentações de entrada ou saída, retornando 201 e atualizando o saldo correspondente. | M4, pp. 6–9. |
| RF07 | O sistema deve registrar automaticamente o usuário autenticado como responsável por cada movimentação, sem aceitar um responsável escolhido pelo corpo da requisição. | M5, pp. 3–4. |

O cadastro com perfil segue o exemplo pedagógico do módulo 3. A menção a “atualiza” na RN01 do módulo 6, p. 3, é atendida pela alteração da quantidade_estoque nas movimentações; o contrato tem as seis operações documentadas no README.

## Requisitos não funcionais

| Código | Categoria | Requisito testável | Referência |
|---|---|---|---|
| RNF01 | Segurança | As senhas devem ser armazenadas como hash bcrypt, com custo 10, e não devem aparecer nas respostas de cadastro/login. | M3, pp. 4–5; M6, p. 3. |
| RNF02 | Segurança | As rotas de produtos e movimentações devem exigir token JWT válido; o token de login deve expirar após oito horas. | M3, pp. 7–9; M4, p. 4. |
| RNF03 | Desempenho | A listagem de produtos deve responder em até dois segundos no ambiente local e com a massa de dados registrada no plano de testes. | M6, p. 4; M7, pp. 1 e 6. |
| RNF04 | Usabilidade | As mensagens de erro devem explicar o problema em português. | M6, p. 4; M7, pp. 1 e 3. |
| RNF05 | Infraestrutura | O sistema deve executar em Node.js e persistir usuários, produtos e movimentações em MySQL. | M1, pp. 1 e 3; M6, pp. 3–4. |

“Hash bcrypt” descreve precisamente o mecanismo mostrado no módulo 3, que o material também chama de criptografia. O exemplo conceitual de expiração de uma hora do módulo 6, p. 3, não altera as oito horas implementadas no módulo 3.

## Regras de negócio e localização

| Código | Regra | Onde se aplica |
|---|---|---|
| RN01 | Somente administrador pode excluir produto. Operador consulta, cadastra e atualiza o saldo por movimentação. | `src/routes/produtoRoutes.js` aplica autenticação e `permitir('administrador')` na exclusão; `src/middlewares/checkRole.js` verifica o perfil. |
| RN02 | Toda movimentação deve ter o usuário autenticado como responsável. | `src/controllers/movimentacaoController.js` passa `req.usuario` ao service; `cadastrar` em `src/services/movimentacaoService.js` lê seu ID e grava `usuario_id`. |
| RN03 | A movimentação deve ser do tipo `entrada` ou `saida`. | `cadastrar` em `src/services/movimentacaoService.js` valida o tipo; o model `src/models/Movimentacao.js` usa ENUM. |
| RN04 | A quantidade movimentada deve ser inteira e maior que zero. | `cadastrar` em `src/services/movimentacaoService.js` valida a quantidade antes de atualizar o saldo. |
| RN05 | Uma saída não pode exceder o estoque disponível. | `cadastrar` em `src/services/movimentacaoService.js` compara quantidade e quantidade_estoque; recusa com 400 sem gravar a saída. |

Referências: RN01 — M5, p. 5 e M6, p. 3; RN02 — M5, pp. 3–4; RN03 — M4, p. 3; RN04 — M7, pp. 1 e 9; RN05 — M4, pp. 6–9.

As regras de estoque ficam na camada Service, conforme o módulo 2, pp. 1–2. Se uma regra documentada não aparecer no código, ela ainda não foi implementada e precisa ser corrigida antes da entrega.

## Conferência

Os casos e a matriz em `docs/testes.md` e `docs/testes.xlsx` devem ligar cada RF, RNF e RN à execução real. O ambiente, tempo da listagem, persistência, mensagens, caminhos felizes e caminhos de erro precisam ter evidência. O requisito não é considerado atendido apenas por estar nesta lista.
