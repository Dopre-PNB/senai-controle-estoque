# Módulo 9 — Integração

**Pedro do Nascimento Braga — Turma 996**

Verificação em 16/10/2026, com dados fictícios em banco MySQL isolado. Ações de tela executadas no navegador; persistência conferida por SQL e visualmente no MySQL Workbench.

| Nº | Ação | Resultado |
|---|---|---|
| 1 | Painel sem login | Volta ao login |
| 2 | Senha errada | Mensagem vermelha |
| 3 | Login de operador | Painel e token salvo |
| 4 | Listar produtos | Dados do banco |
| 5 | Cadastrar produto | Sucesso e produto encontrado |
| 6 | Buscar parte do nome | Somente correspondências |
| 7 | Paginar | 5 itens; botões desativados nas pontas |
| 8 | Operador excluindo | Permissão negada |
| 9 | Entrada de 3 | Estoque 10 → 13; histórico verde |
| 10 | Saída de 2 | Estoque 13 → 11; histórico vermelho |
| 11 | Saída de 99 | Recusada; estoque mantido |
| 12 | Sair e entrar como administrador | Token apagado; novo login aprovado |
| 13 | Excluir produto sem movimentações | Produto removido |
| 14 | Conferir no banco | Dados confirmados por SQL e Workbench |

Também aprovados: 12 verificações de tamanho de tela, página Sobre, modo escuro, cadastro de usuário com login, sessão expirada, autenticação e ordem do histórico, texto seguro contra XSS e mensagem de falha de conexão. Nenhum erro de JavaScript.

[Resultados completos](resultados.json) · [Capturas](evidencias)
