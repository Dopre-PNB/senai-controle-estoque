if (pegarToken()) {
  window.location.href = 'painel.html';
}

const formLogin = document.getElementById('form-login');
formLogin.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await resposta.json();
    if (resposta.ok) {
      localStorage.setItem('token', dados.token);
      window.location.href = 'painel.html';
    } else {
      mostrarMensagem(dados.mensagem || dados.erro, 'erro');
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'erro');
  }
});
