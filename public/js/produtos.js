let paginaAtual = 1;
const limite = 5;

async function carregarProdutos() {
  const nome = document.getElementById('busca-nome').value;
  try {
    const resposta = await fetch(`/produtos?pagina=${paginaAtual}&limite=${limite}&nome=${encodeURIComponent(nome)}`, {
      headers: { 'Authorization': 'Bearer ' + pegarToken() },
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (!resposta.ok) {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
      return;
    }
    const tabela = document.getElementById('lista-produtos');
    tabela.innerHTML = '';
    if (dados.length === 0) {
      tabela.innerHTML = '<tr><td colspan="5">Nenhum produto encontrado.</td></tr>';
    }
    dados.forEach(function (produto) {
      tabela.innerHTML += `
        <tr>
          <td>${produto.id}</td>
          <td>${protegerTexto(produto.nome)}</td>
          <td>${protegerTexto(produto.descricao)}</td>
          <td>${produto.quantidade_estoque}</td>
          <td><button type="button" class="botao botao-perigo botao-pequeno" onclick="excluirProduto(${produto.id})">Excluir</button></td>
        </tr>`;
    });
    document.getElementById('numero-pagina').textContent = paginaAtual;
    document.getElementById('botao-anterior').disabled = paginaAtual === 1;
    document.getElementById('botao-proxima').disabled = dados.length < limite;
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
}

const formProduto = document.getElementById('form-produto');
formProduto.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const produto = {
    nome: document.getElementById('nome').value,
    descricao: document.getElementById('descricao').value,
    quantidade_estoque: Number(document.getElementById('quantidade_estoque').value),
  };
  try {
    const resposta = await fetch('/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + pegarToken(),
      },
      body: JSON.stringify(produto),
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (resposta.ok) {
      mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso');
      formProduto.reset();
      carregarProdutos();
    } else {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
});

async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  try {
    const resposta = await fetch(`/produtos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + pegarToken() },
    });
    if (tratarSessaoExpirada(resposta)) return;
    const dados = await resposta.json();
    if (resposta.ok) {
      mostrarMensagem(dados.mensagem, 'sucesso');
      carregarProdutos();
    } else {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
}

document.getElementById('botao-buscar').addEventListener('click', function () {
  paginaAtual = 1;
  carregarProdutos();
});
document.getElementById('botao-anterior').addEventListener('click', function () {
  paginaAtual = paginaAtual - 1;
  carregarProdutos();
});
document.getElementById('botao-proxima').addEventListener('click', function () {
  paginaAtual = paginaAtual + 1;
  carregarProdutos();
});

if (protegerPagina()) carregarProdutos();
