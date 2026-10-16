const formCadastro = document.getElementById('form-cadastro');
formCadastro.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const usuario = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value,
    tipo: document.getElementById('tipo').value,
  };
  try {
    const resposta = await fetch('/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      mostrarMensagem('Usuário cadastrado com sucesso! Faça login.', 'sucesso');
      formCadastro.reset();
    } else {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
});
