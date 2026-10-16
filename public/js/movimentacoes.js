let produtos = [];

async function carregarProdutosNaLista() {
  try {
    const resposta = await fetch('/produtos?limite=100', {
      headers: { 'Authorization': 'Bearer ' + pegarToken() },
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
      return;
    }
    produtos = dados;
    const lista = document.getElementById('produto_id');
    lista.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach(function (produto) {
      lista.innerHTML += `<option value="${produto.id}">${protegerTexto(produto.nome)} (estoque: ${produto.quantidade_estoque})</option>`;
    });
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
}

async function carregarHistorico() {
  try {
    const resposta = await fetch('/movimentacoes', {
      headers: { 'Authorization': 'Bearer ' + pegarToken() },
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
      return;
    }
    const tabela = document.getElementById('lista-movimentacoes');
    tabela.innerHTML = '';
    if (dados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="4">Nenhuma movimentação registrada.</td></tr>';
    }
    dados.forEach(function (mov) {
      const produto = produtos.find(function (p) { return p.id === mov.produto_id; });
      const nome = produto ? produto.nome : (mov.produto_id ? 'Produto nº ' + mov.produto_id : 'Produto excluído');
      const data = new Date(mov.createdAt).toLocaleDateString('pt-BR');
      const textoTipo = mov.tipo === 'entrada' ? 'Entrada' : 'Saída';
      tabela.innerHTML += `
        <tr>
          <td>${data}</td>
          <td>${protegerTexto(nome)}</td>
          <td><span class="etiqueta ${mov.tipo}">${textoTipo}</span></td>
          <td>${mov.quantidade}</td>
        </tr>`;
    });
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
}

async function iniciar() {
  await carregarProdutosNaLista();
  if (pegarToken()) await carregarHistorico();
}

const formMovimentacao = document.getElementById('form-movimentacao');
formMovimentacao.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const movimentacao = {
    produto_id: Number(document.getElementById('produto_id').value),
    tipo: document.getElementById('tipo').value,
    quantidade: Number(document.getElementById('quantidade').value),
  };
  try {
    const resposta = await fetch('/movimentacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + pegarToken(),
      },
      body: JSON.stringify(movimentacao),
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (resposta.ok) {
      mostrarMensagem('Movimentação registrada com sucesso!', 'sucesso');
      formMovimentacao.reset();
      iniciar();
    } else {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
});

if (protegerPagina()) iniciar();
