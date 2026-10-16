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

1. **Feliz e erro por requisito:** a tabela responde quais situações verificariam cada um dos 17 requisitos. Ela descreve os resultados esperados; os resultados realmente observados estão em [testes.md](testes.md) e [execucao.json](evidencias/execucao.json).

| Requisito | Caminho feliz e resultado esperado | Caminho de erro e resultado esperado |
|---|---|---|
| RF01 — cadastro de usuário | Nome, email exclusivo, senha e perfil válido: 201, usuário persistido sem senha/hash na resposta. | Email repetido, nome ausente ou perfil gerente: 400, sem novo usuário inválido. |
| RF02 — login | Email e senha corretos: 200 e token do usuário. | Senha errada ou email inexistente: 401 e nenhum token. |
| RF03 — cadastro de produto | Dados completos e estoque inteiro não negativo: 201; estoque omitido assume zero. | Nome ausente ou estoque negativo/fracionário: 400 e nenhum produto inválido. |
| RF04 — listagem | Token válido, página/limite positivos e filtros válidos: 200 com array dos produtos correspondentes. | Página zero/fracionária, limite zero ou data inválida: 400 com explicação. |
| RF05 — exclusão | Administrador exclui ID existente: 200 e produto ausente no banco. | Operador: 403 e produto preservado; administrador com ID inexistente: 404. |
| RF06 — movimentação | Entrada ou saída válida: 201, saldo ajustado e registro persistido. | Quantidade zero, tipo inválido ou saída acima do saldo: 400, saldo e histórico preservados. |
| RF07 — responsável automático | Movimentação registra o ID do usuário autenticado. | Corpo tenta informar outro usuario_id: o ID forjado é ignorado e o responsável permanece o do token. |
| RNF01 — proteção da senha | Cadastro grava hash bcrypt e a resposta não mostra senha/hash. | Se houver senha em texto puro no banco ou senha/hash na resposta, a verificação deve falhar. |
| RNF02 — token | JWT válido permite acesso; login emite token com expiração de oito horas. | Token ausente, inválido ou expirado: 401 e acesso negado. |
| RNF03 — desempenho | Cada listagem do ambiente/massa definidos responde em até 2.000 ms. | Se a medição superar 2.000 ms, o requisito deve ser classificado como não atendido. |
| RNF04 — português | Entrada inválida recebe mensagem em português que explica o problema. | Mensagem ausente, incompreensível ou em outro idioma deve reprovar a verificação de usabilidade. |
| RNF05 — infraestrutura | API executa em Node.js e grava/consulta os registros no MySQL real. | MySQL indisponível impede preparar/iniciar o sistema; registrar bloqueio de ambiente, sem declarar persistência comprovada. |
| RN01 — administrador exclui | Administrador autenticado exclui produto existente: 200. | Operador tenta excluir: 403, produto permanece. |
| RN02 — usuário responsável | Registro contém o ID do usuário identificado pelo token. | Tentativa de atribuir a movimentação a outro ID no corpo é ignorada; responsável continua sendo o autenticado. |
| RN03 — tipo permitido | Tipos entrada e saida são aceitos em movimentações válidas. | Tipo ajuste: 400 e nenhuma alteração de saldo/histórico. |
| RN04 — quantidade positiva | Quantidade inteira 1 é aceita, inclusive no limite inferior. | Quantidades 0, −1 ou 1,5: 400 e nenhuma alteração de saldo/histórico. |
| RN05 — estoque suficiente | Saída de quantidade menor ou igual ao saldo é permitida e não deixa estoque negativo. | Saída maior que o saldo: 400, mantendo saldo e histórico. |

Os erros hipotéticos de senha armazenada/exposta (RNF01), tempo acima do limite (RNF03), mensagem inadequada (RNF04) e indisponibilidade do MySQL (RNF05) não foram provocados como novas execuções. A tabela é a análise dos caminhos solicitada no exercício; não aumenta a contagem dos 22 casos reais.

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

3. **Plano:** testar as seis operações, regras e RNF no Node/MySQL local, com requisições HTTP e conferência no banco. Usar teste de sistema, integração, segurança, desempenho, caixa-preta e valores limite. Entrada: API/banco disponíveis, administrador, operador e pelo menos três produtos. Saída: todos os casos executados, sem defeito crítico/alto aberto. A execução automática usa o script `verificar.js`. O cronograma realizado em 08/10/2026, com horários locais e fontes de evidência, está em `docs/testes.md`, junto de versões e massa. A aceitação pelo professor depende de avaliação efetiva.
4. **Rastreabilidade:** `docs/testes.md` e `docs/testes.xlsx` devem cobrir RF01–RF07, RNF01–RNF05 e RN01–RN05. Se a matriz mostrar lacuna, adicionar um caso antes de concluir. Os doze exemplos acima são uma seleção; a matriz completa também cobre cadastro, hash, expiração, data, português e infraestrutura.
5. **Execução:** `npm test` foi executado contra MySQL real em schema isolado. A rodada final automática registrou 22 casos, todos aprovados, com obtido, status e evidência no [relatório](testes.md) e em [execucao.json](evidencias/execucao.json). A planilha `testes.xlsx` consolida esses registros. Em 09/10/2026, os dez cenários práticos foram executados também pela interface do Postman, com conferências no MySQL Workbench. Os dez passaram e as 14 capturas estão na [entrega do módulo 7](modulo7/README.md).
6. **Defeitos e resumo:** a rodada final teve 22 Passou, zero Falhou, zero Bloqueado e zero defeitos abertos; o critério de saída foi atendido. A [rodada inicial](evidencias/execucao-instrumentacao-inicial.json) foi preservada: um falso positivo do verificador foi corrigido, mantendo os resultados esperados, e a regressão completa passou. Para qualquer falha real futura, registrar DFxx com reprodução, esperado/obtido, severidade, evidência e status, corrigir e retestar antes de fechar.
