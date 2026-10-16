# Controle de estoque do almoxarifado

Sistema para aplicar os módulos 1 a 9 de Desenvolvimento de Sistemas do SENAI. O domínio é um almoxarifado, adaptação da biblioteca solicitada no módulo 6, p. 5.

O projeto oferece cadastro de usuários, login, cadastro/listagem/exclusão de produtos e movimentações de entrada ou saída. As telas usam HTML, CSS e JavaScript, servidos pelo próprio Express. As regras ficam nos services, com rotas, controllers, models e middlewares separados (módulo 2, pp. 1–3).

## Preparação

É necessário ter Node.js/npm e um servidor MySQL acessível. As dependências são Express, mysql2, Sequelize, jsonwebtoken, bcrypt e dotenv, como no módulo 1, p. 3; as versões instaladas ficam registradas no lockfile.

Na pasta do projeto:

```powershell
npm ci
Copy-Item .env.example .env
```

Preencha o `.env` com os dados do seu MySQL e um segredo JWT:

| Variável | Significado |
|---|---|
| DB_HOST | Endereço do MySQL. |
| DB_USER | Usuário do banco. |
| DB_PASSWORD | Senha desse usuário. |
| DB_NAME | Nome do banco do projeto. |
| DB_PORT | Porta do MySQL, normalmente 3306. |
| DB_TEST_NAME | Prefixo do banco de testes, padrão `senai_estoque_test`; deve ser diferente de DB_NAME. |
| JWT_SECRET | Segredo usado para assinar e verificar o token. |
| PORT | Porta da API, padrão 3000. |

Crie o banco e inicie a API:

```powershell
npm run db:create
npm start
```

O usuário MySQL configurado precisa ter permissão para criar o banco; alternativamente, crie-o previamente no MySQL. A inicialização conecta e sincroniza os models antes de abrir a porta HTTP. Se o PowerShell bloquear `npm`, use `npm.cmd` nos mesmos comandos.

O `.env` e `node_modules/` ficam fora do Git. O `.env.example` documenta a configuração sem dados reais (módulo 1, pp. 3–5).

## Telas — módulos 8 e 9

Com o servidor iniciado, abra `http://localhost:3000`. Use **Criar conta** para cadastrar um usuário e depois entre com email e senha. As páginas são login, painel, produtos, movimentações, sobre e cadastro. O visual Estoque Braga inclui menu ativo, modo escuro automático e adaptação para computador, tablet e celular.

Na tela de produtos, cadastre, busque por nome e use a paginação de cinco itens. A exclusão exige perfil administrador. Em movimentações, selecione um produto e registre uma entrada ou saída; o saldo e o histórico são atualizados. **Sair** encerra a sessão.

Os exemplos de livros dos documentos foram adaptados para produtos, mantendo o domínio já definido no módulo 6. Os scripts usam a API existente, token no navegador e tratamento de mensagens e sessão expirada, conforme o módulo 9.

## API

Envie o corpo como JSON. Nas rotas protegidas, use o cabeçalho `Authorization: Bearer TOKEN`, substituindo TOKEN pelo valor recebido no login.

| Método e rota | Acesso | Corpo ou consulta |
|---|---|---|
| POST /usuarios | Público | `nome`, `email`, `senha`, `tipo`. |
| POST /login | Público | `email`, `senha`. |
| POST /produtos | Autenticado | `nome`, `descricao`, `quantidade_estoque` opcional. |
| GET /produtos | Autenticado | `pagina`, `limite`, `nome`, `data` opcionais. |
| DELETE /produtos/:id | Administrador autenticado | ID na rota. |
| POST /movimentacoes | Autenticado | `produto_id`, `tipo`, `quantidade`. |
| GET /movimentacoes | Autenticado | Histórico por data decrescente. |

Cadastro de usuário:

```json
{
  "nome": "Operador do almoxarifado",
  "email": "operador@example.com",
  "senha": "senha-de-exemplo",
  "tipo": "operador"
}
```

Os perfis aceitos são `administrador` e `operador`. O cadastro público recebe o perfil conforme o exemplo pedagógico do módulo 3, pp. 4–6. A senha é armazenada com hash bcrypt e não aparece na resposta; login válido retorna um JWT com duração de oito horas.

Cadastro de produto:

```json
{
  "nome": "Parafuso M6",
  "descricao": "Unidade para manutenção",
  "quantidade_estoque": 10
}
```

O saldo inicial é salvo diretamente, como no módulo 4, p. 3, e vale zero quando omitido.

Exemplo de listagem: `GET /produtos?pagina=1&limite=2&nome=parafuso&data=2026-01-01`. A resposta é um array; os padrões são página 1 e limite 10. `nome` procura um trecho e `data` filtra cadastros em `createdAt` a partir da data informada, inclusive (módulo 5, pp. 1–2).

Movimentação:

```json
{
  "produto_id": 1,
  "tipo": "saida",
  "quantidade": 3
}
```

Use o ID real do produto. O tipo aceita `entrada` ou `saida`, e a quantidade deve ser um inteiro maior que zero. Entrada soma e saída subtrai; saída maior que o saldo retorna 400. O registro recebe data automática e `usuario_id` do token (módulo 4, pp. 6–9; módulo 5, pp. 3–4).

A exclusão retorna 200 quando remove o produto, 404 quando ele não existe e 403 para operador. Produtos com movimentações também podem ser excluídos: a chave `produto_id` dos registros existentes fica nula pelo relacionamento `SET NULL`. A atualização do estoque pelo operador ocorre nas movimentações.

## Verificação e documentação

```powershell
npm test
```

O comando corresponde a `node scripts/verificar.js`. A verificação registra os resultados reais em `docs/evidencias/execucao.json` e `docs/testes.md`; a planilha `docs/testes.xlsx` reúne os casos e a rastreabilidade para entrega.

A rodada documentada executou **22 casos: 22 passaram, zero falhas, zero bloqueios e zero defeitos abertos**. O critério de saída foi atendido. Consulte o [relatório](docs/testes.md) e as [evidências HTTP/MySQL](docs/evidencias/execucao.json).

Cada execução cria um schema de teste novo, usando DB_TEST_NAME com um sufixo próprio, e preserva esse schema para conferência. O usuário MySQL precisa ter permissão para criá-lo. A verificação usa esse banco separado do DB_NAME da aplicação.

Para reproduzir as chamadas no Postman:

1. Importe [api.postman_collection.json](docs/api.postman_collection.json), no formato de coleção Postman v2.1.
2. Inicie uma instância da API com banco de testes e, nas variáveis da coleção, ajuste `baseUrl` para seu endereço, por exemplo `http://localhost:3000`.
3. Execute as pastas em ordem pelo Collection Runner. Os scripts locais preenchem emails, senha de teste, tokens e IDs; CT14 deve ocorrer antes de CT15. Para uma nova rodada, limpe a variável `execucao`.
4. Para o cenário de expiração de CT07, informe um JWT já expirado em `tokenExpirado`. Para CT12, prepare as datas das fixtures no MySQL conforme a descrição da requisição.
5. Confira a persistência no MySQL. `npm test` faz as verificações de banco, hash e datas controladas automaticamente; a coleção não cria o banco nem inicia o servidor.

- [Requisitos e modelagem](docs/requisitos.md): RF01–RF07, RNF01–RNF05 e RN01–RN05.
- [Plano revisado](docs/plano.md): sequência original dos módulos 1 a 7.
- [Exercícios respondidos](docs/exercicios.md): atividades dos módulos 2, 6 e 7.
- [Plano e resultados dos testes](docs/testes.md): esperado, obtido, status, evidência, defeitos e resumo.
- [Planilha de testes](docs/testes.xlsx): registro dos casos e cobertura dos requisitos.
- [Módulo 7](docs/modulo7/README.md): entrega complementar e registro da prática por interface.
- [Documento do módulo 7](docs/modulo7/Modulo7_Testes.docx): relatório editável para entrega acadêmica.
- [Módulo 8](docs/modulo8/testes.md): verificação das telas e dos exercícios.
- [Módulo 9](docs/modulo9/testes.md): roteiro de integração e evidências.

A aceitação pelo professor depende da avaliação efetiva do trabalho. Repositório: [Dopre-PNB/senai-controle-estoque](https://github.com/Dopre-PNB/senai-controle-estoque), privado.
