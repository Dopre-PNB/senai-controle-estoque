function pegarToken() {
  return localStorage.getItem('token');
}

function protegerPagina() {
  if (!pegarToken()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function mostrarMensagem(texto, tipo) {
  const mensagem = document.getElementById('mensagem');
  mensagem.textContent = texto;
  mensagem.className = 'mensagem ' + tipo;
}

function tratarSessaoExpirada(resposta) {
  if (resposta.status === 401) {
    localStorage.removeItem('token');
    alert('Sua sessão expirou. Faça login novamente.');
    window.location.href = 'index.html';
    return true;
  }
  return false;
}

function protegerTexto(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

const linkSair = document.getElementById('link-sair');
if (linkSair) {
  linkSair.addEventListener('click', function () {
    localStorage.removeItem('token');
  });
}
