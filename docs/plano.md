# Plano de implementação dos sete módulos

Escopo definido em 08/10/2026: uma API de almoxarifado, com três entidades e seis operações HTTP, seguida da entrega em um repositório privado no GitHub. O domínio adapta a biblioteca, conforme o módulo 6, p. 5.

## 1. Base e arquitetura — módulos 1 e 2

- Usar `sistema-estoque/` como raiz do projeto, Node.js, MySQL e as seis bibliotecas dos PDFs: Express, mysql2, Sequelize, jsonwebtoken, bcrypt e dotenv.
- Reaproveitar o padrão de usuário/login de `backend-usuarios`, acrescentando as camadas e operações restantes.
- Manter `src/config`, `models`, `routes`, `controllers`, `services` e `middlewares`; concentrar as regras de estoque em um service pequeno.
- Configurar `.env`, `.env.example`, `.gitignore`, `package.json` e lockfile. Criar o banco e aguardar conexão/sincronização antes de iniciar a API.
- Modelar Usuario, Produto e Movimentacao, com relações de um para muitos e responsável identificado pelo token.

Referências: M1, pp. 3–8; M2, pp. 1–3. Os PDFs não fixam versões das bibliotecas.

## 2. Contrato mínimo — módulos 3, 4 e 5

| Operação | Acesso | Resultado esperado |
|---|---|---|
| POST /usuarios | Público | Nome, email, senha e tipo; 201, sem senha/hash na resposta. |
| POST /login | Público | 200 com JWT de oito horas; credenciais inválidas: 401. |
| POST /produtos | Autenticado | Nome, descrição e quantidade_estoque; 201; saldo inicial direto, padrão zero. |
| GET /produtos | Autenticado | 200 com array; pagina=1 e limite=10; filtros opcionais nome/data. |
| DELETE /produtos/:id | Administrador autenticado | 200 ao excluir; 404 se inexistente; operador recebe 403. |
| POST /movimentacoes | Autenticado | Produto, entrada/saida e quantidade inteira positiva; 201 com registro e saldo atualizado. |

- Usar bcrypt no cadastro e JWT no login, com os perfis `administrador` e `operador`.
- O cadastro público aceita o perfil, seguindo o exemplo pedagógico do módulo 3, pp. 4–6.
- Na listagem, `nome` procura um trecho e `data` seleciona `createdAt >= data`; retornar o array mostrado no módulo 5, pp. 1–2.
- Cada movimentação recebe data automática e `usuario_id` do token, soma ou subtrai do saldo e recusa saída superior ao disponível.
- A exclusão segue o módulo 5, pp. 4–5. A relação usa `SET NULL` para permitir excluir produto com movimentações, sem acrescentar bloqueio por histórico.
- A menção a “atualiza” nos módulos 5 e 6 é aplicada à atualização do estoque por movimentação.

Referências: M3, pp. 3–10; M4, pp. 1–9; M5, pp. 1–6.

## 3. Requisitos e exercícios — módulos 2, 6 e 7

- Escrever RF01–RF07, RNF01–RNF05 e RN01–RN05 em `docs/requisitos.md`, com referências aos módulos e ao código.
- Responder a modelagem do módulo 2 e todos os exercícios dos módulos 6 e 7 em `docs/exercicios.md`.
- Cobrir segurança, listagem em até dois segundos, mensagens em português e infraestrutura Node.js/MySQL.
- Documentar o preparo do banco, configuração, comandos e uso das seis rotas no README.

Referências: M2, p. 3; M6, pp. 2–5; M7, pp. 10–11.

## 4. Testes e evidências — módulo 7

- Preparar administrador, operador e pelo menos três produtos com nomes úteis ao filtro.
- Escrever os resultados esperados antes de executar; cobrir os dez cenários do PDF e as regras de quantidade, saldo, data e responsável.
- Executar testes funcionais e de segurança, com pelo menos três erros e um valor limite; medir a listagem e conferir persistência no MySQL.
- Registrar plano, casos, rastreabilidade, resultados, evidências, defeitos reais e resumo em `docs/testes.md` e `docs/testes.xlsx`.
- O script `scripts/verificar.js` produzirá `docs/evidencias/execucao.json`; preencher resultados somente com a execução real.
- Se houver falha, corrigir, retestar e repetir os casos anteriores. Critério de saída: todos executados e nenhum defeito crítico/alto aberto.

Referências: M7, pp. 5–11. A execução real foi concluída em 08/10/2026 (America/Sao_Paulo): 22 casos aprovados, nenhum caso falhou ou ficou bloqueado. As evidências estão em `docs/evidencias/execucao.json`.

## 5. Executar e entregar no GitHub

1. Instalar as dependências com `npm ci` e preencher `.env` a partir do exemplo.
2. Criar o banco com `npm run db:create`; iniciar com `npm start`; verificar com `npm test`.
3. Conferir documentação e evidências; excluir configurações locais, senhas, tokens e `node_modules` do conteúdo versionado.
4. Após a validação, criar o repositório privado `Dopre-PNB/senai-controle-estoque`, registrar o projeto e enviar a branch `main`.
5. Conferir os arquivos e o commit no GitHub e informar o endereço real da entrega.

Scripts previstos: `start → node src/app.js`, `db:create → node scripts/criar-banco.js` e `test → node scripts/verificar.js`.

A implementação, os testes e a revisão dos arquivos estão concluídos. Repositório da entrega: [Dopre-PNB/senai-controle-estoque](https://github.com/Dopre-PNB/senai-controle-estoque), privado.
