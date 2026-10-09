# Exercícios dos módulos 2, 6 e 7

As respostas conceituais abaixo usam as páginas dos PDFs entregues. Exemplos de escola, clientes e livros pertencem aos exercícios; não acrescentam rotas ao almoxarifado.

## Módulo 2 — modelagem do projeto (p. 3)

1. **Item principal:** Produto do almoxarifado, com id, nome, descrição, quantidade_estoque e datas de cadastro/alteração. Usuario tem id, nome, email único, hash da senha e perfil.
2. **Evento registrado:** Movimentacao de entrada ou saída, com produto_id, usuario_id, tipo, quantidade e data/hora automática.
3. **Relacionamentos:** um Produto recebe muitas Movimentacoes e um Usuario registra muitas Movimentacoes. As chaves estrangeiras ficam na Movimentacao. No registro, o produto existe e o usuário vem do token; após exclusão do produto, sua chave fica nula pelo `SET NULL`.
4. **Regra de disponibilidade:** saída só é permitida quando a quantidade é inteira, positiva e não supera o saldo. O Service verifica a regra, atualiza o saldo e grava a movimentação; o Controller recebe a requisição e o Model representa a tabela.

## Módulo 6 — nível 1: classificação (pp. 4–5)

| Nº | Frase do exercício | Tipo | Motivo |
|---|---|---|---|
| 1 | Professor lança notas dos alunos. | RF | Ação oferecida pelo sistema. |
| 2 | Funciona no Chrome, Edge e Firefox. | RNF | Compatibilidade. |
| 3 | Mais de 25% de faltas reprova o aluno. | RN | Regra da escola. |
| 4 | Gera boletim em PDF. | RF | Função de geração do documento. |
| 5 | Páginas carregam em até dois segundos. | RNF | Desempenho mensurável. |
| 6 | Aluno altera a própria senha. | RF | Ação disponível ao aluno. |
| 7 | Apenas coordenação altera nota fechada. | RN | Restrição de responsabilidade da escola. |
| 8 | Dados ficam em MySQL. | RNF | Infraestrutura. |
| 9 | Envia email quando uma nota é lançada. | RF | Ação automática. |
| 10 | Média final é a média das quatro notas bimestrais. | RN | Fórmula definida pelo negócio. |

## Módulo 6 — nível 2: requisitos reescritos (p. 5)

Os critérios abaixo são propostas mensuráveis para o exercício; em um projeto real seriam combinados com o cliente.

| Nº | Problema | Reescrita testável |
|---|---|---|
| 1 — “bonito” | Critério subjetivo, sem referência visual. | RNF: As telas devem usar as cores, fontes e espaçamentos do protótipo aprovado, conferidos por comparação visual. |
| 2 — “abrir rápido no celular” | Não define prazo, dispositivo ou condição da medição. | RNF: A página inicial deve carregar em até dois segundos em um celular Android com Chrome, na conexão e no ambiente registrados no plano de testes. |
| 3 — cadastrar clientes e emitir notas fiscais | Junta duas funções em um requisito. | RF01: O sistema deve permitir cadastrar clientes com nome e CPF/CNPJ. RF02: O sistema deve permitir emitir nota fiscal para uma venda registrada. |
| 4 — “proteger os dados” | Não define mecanismo nem acesso permitido. | RNF: As rotas com dados de clientes devem exigir usuário autenticado e negar a consulta quando não houver sessão válida. |

## Módulo 6 — nível 3: requisitos do almoxarifado (p. 5)

1. **Ações:** RF01–RF07 em [requisitos.md](requisitos.md) descrevem cadastro de usuário, login, cadastro/listagem/exclusão de produto, movimentação e responsável automático; excedem os cinco RF pedidos.
2. **Qualidades:** RNF01–RNF05 cobrem segurança, desempenho, usabilidade e infraestrutura, atendendo às três categorias mínimas.
3. **Regras do negócio:** RN01–RN05 cobrem administrador na exclusão, responsável, tipos permitidos, quantidade positiva e estoque suficiente; excedem as duas RN pedidas.
4. **Código:** a tabela de regras em [requisitos.md](requisitos.md) identifica rota/middleware/service/model. Regra sem implementação representa uma pendência ou defeito, e não uma regra já atendida.
5. **Revisão:** tempos e valores foram definidos; cada requisito tem ID e um comportamento verificável. A listagem possui os parâmetros que compõem a mesma operação. As evidências confirmarão atendimento, sem usar “rápido”, “fácil” ou “seguro” como critérios.

## Módulo 7 — nível 1: nível, tipo ou técnica (p. 10)

| Nº | Situação | Classificação | Justificativa |
|---|---|---|---|
| 1 | Função calcularMulta isolada, sem banco/rotas. | Unidade | Testa uma parte pequena isolada. |
| 2 | Repete casos anteriores depois de corrigir o login. | Regressão | Procura efeitos da alteração no que já funcionava. |
| 3 | Bibliotecária usa e aprova formalmente a entrega. | Aceitação | Usuário final avalia a necessidade real. |
| 4 | Envia mil requisições simultâneas. | Não funcional — desempenho/carga | Mede comportamento sob muitas requisições; estresse exigiria exceder a capacidade até o limite. |
| 5 | Rota, autenticação e banco trabalhando juntos. | Integração | Verifica a comunicação entre componentes. |
| 6 | Postman, sem ler código, comparando respostas. | Caixa-preta | Técnica baseada em entradas e saídas; a situação não identifica por si só um nível. |

## Módulo 7 — nível 2.1: corrigir o caso incompleto (p. 10)

O caso “Testar cadastro / cadastrar um livro / funcionar corretamente” tem estes problemas: não possui ID, requisito, pré-condições ou dados exatos; seus passos não permitem repetir o teste; o esperado não tem status ou conteúdo verificável; faltam campos de obtido, status e evidência.

Caso reescrito, preservando a biblioteca do enunciado:

| Campo | Conteúdo |
|---|---|
| ID | EX-CT01. |
| Requisito relacionado | RF03 — cadastrar livro; RNF02 — rota protegida por token. |
| Título/objetivo | Cadastrar livro válido com usuário autenticado. |
| Pré-condições | API da biblioteca e MySQL disponíveis; usuário cadastrado; token válido; dados exclusivos para este teste. |
| Passos | 1. Fazer login. 2. Enviar POST /livros com JSON e Authorization Bearer TOKEN. 3. Conferir status/corpo. 4. Consultar o livro no MySQL. |
| Dados de entrada | titulo: “Livro de teste EX-CT01”; autor: “Autor de teste”; quantidade_estoque: 10; token válido. |
| Resultado esperado | Status 201; corpo com ID, título, autor e estoque 10; linha correspondente no banco. |
| Resultado obtido | Não preenchido: exercício de elaboração, ainda não executado. |
| Status | Pendente de execução; após executar, usar Passou, Falhou ou Bloqueado. |
| Evidência | Quando executado, salvar EX-CT01_resposta e EX-CT01_banco. |

O esperado foi definido a partir do módulo 4, pp. 3–4, antes de executar; não é um resultado observado.

## Módulo 7 — nível 2.2: valor limite (p. 10)

Regra do exercício: ano de publicação entre 1900 e 2026, inclusive. Grupos: abaixo de 1900 é inválido; de 1900 a 2026 é válido; acima de 2026 é inválido.

| Valor de teste | Resultado esperado |
|---|---|
| 1899 | Recusar, abaixo do mínimo. |
| 1900 | Aceitar, limite inferior inclusive. |
| 2026 | Aceitar, limite superior inclusive. |
| 2027 | Recusar, acima do máximo. |

São as duas bordas e o primeiro valor externo de cada lado. A faixa 1–100 apresentada no módulo 7, p. 4, também é um exemplo didático; não cria um máximo de 100 para movimentações do almoxarifado.

## Módulo 7 — nível 3: testar o almoxarifado (pp. 10–11)

1. **Feliz e erro por requisito:** o cadastro aceita dados válidos e recusa dados inválidos; login aceita senha correta e recusa a errada; produto aceita saldo válido e recusa negativo; listagem aceita filtros válidos e recusa parâmetros inválidos; exclusão permite administrador e bloqueia operador; movimentação aceita entrada/saída válidas e recusa tipo/quantidade/saldo inválidos; responsável é o autenticado e não o ID informado no corpo. Segurança cobre senha/hash e token inválido; desempenho mede o tempo; usabilidade confere português; infraestrutura confere Node/MySQL e persistência. A matriz registra quais casos cobrem cada requisito.
2. **Casos previstos antes de executar:** usar os dez casos do módulo 7, pp. 8–9, adaptando livros para produtos, e complementar data, responsável, tipo, quantidade e saldo. Os exemplos didáticos abaixo já incluem três erros e valor limite. Seus IDs EX-M7 são distintos dos IDs CT da execução real em `docs/casos.json` e `docs/testes.md`.

| ID | Requisito | Caso | Resultado esperado |
|---|---|---|---|
| EX-M7-01 | RF02 | Login correto. | 200 e token. |
| EX-M7-02 | RF02 | Senha errada. | 401 sem token. |
| EX-M7-03 | RNF02 | Listagem sem token. | 401. |
| EX-M7-04 | RF03 | Produto completo e autenticado. | 201 e registro persistido. |
| EX-M7-05 | RF05/RN01 | Operador tenta excluir produto existente. | 403, produto permanece. |
| EX-M7-06 | RF05/RN01 | Administrador exclui o mesmo produto após EX-M7-05. | 200, produto removido. |
| EX-M7-07 | RF04 | pagina=1 e limite=2 com três ou mais produtos. | Array com no máximo dois produtos. |
| EX-M7-08 | RF04 | Filtro nome com trecho cadastrado. | Somente nomes que contêm o trecho. |
| EX-M7-09 | RF06/RF07/RN02 | Entrada válida com usuário autenticado. | 201, saldo aumenta e responsável correto. |
| EX-M7-10 | RF06/RN04 | Quantidade zero. | 400, saldo e histórico não alterados. |
| EX-M7-11 | RF06/RN05 | Saída exatamente igual ao saldo. | 201 e saldo zero; valor limite válido. |
| EX-M7-12 | RF06/RN05 | Saída uma unidade acima do saldo. | 400, saldo e histórico não alterados. |

3. **Plano:** testar as seis operações, regras e RNF no Node/MySQL local, com requisições HTTP e conferência no banco. Usar teste de sistema, integração, segurança, desempenho, caixa-preta e valores limite. Entrada: API/banco disponíveis, administrador, operador e pelo menos três produtos. Saída: todos os casos executados, sem defeito crítico/alto aberto. Responsável, versões, massa e duração real ficam registrados em `docs/testes.md`. A aceitação pelo professor depende de avaliação efetiva.
4. **Rastreabilidade:** `docs/testes.md` e `docs/testes.xlsx` devem cobrir RF01–RF07, RNF01–RNF05 e RN01–RN05. Se a matriz mostrar lacuna, adicionar um caso antes de concluir. Os doze exemplos acima são uma seleção; a matriz completa também cobre cadastro, hash, expiração, data, português e infraestrutura.
5. **Execução:** `npm test` foi executado contra MySQL real em schema isolado. A rodada final registrou 22 casos, todos aprovados, com obtido, status e evidência no [relatório](testes.md) e em [execucao.json](evidencias/execucao.json). A planilha `testes.xlsx` consolida esses registros.
6. **Defeitos e resumo:** a rodada final teve 22 Passou, zero Falhou, zero Bloqueado e zero defeitos abertos; o critério de saída foi atendido. A [rodada inicial](evidencias/execucao-instrumentacao-inicial.json) foi preservada: um falso positivo do verificador foi corrigido, mantendo os resultados esperados, e a regressão completa passou. Para qualquer falha real futura, registrar DFxx com reprodução, esperado/obtido, severidade, evidência e status, corrigir e retestar antes de fechar.
