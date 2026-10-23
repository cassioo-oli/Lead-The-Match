import { auth } from './firebase.js';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';

const formularioLogin = document.getElementById('loginForm');
const statusLogin = document.getElementById('loginStatus');
const botaoLogin = formularioLogin.querySelector('button[type="submit"]');

onAuthStateChanged(auth, (usuario) => {
  if (usuario) window.location.replace('index.html');
});

function mensagemDoErro(erro) {
  if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(erro.code)) return 'E-mail ou senha incorretos.';
  if (erro.code === 'auth/too-many-requests') return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (erro.code === 'auth/network-request-failed') return 'Sem conexão com a internet. Verifique a rede e tente novamente.';
  if (erro.code === 'auth/unauthorized-domain') return 'Este endereço do site ainda não foi autorizado no Firebase Authentication.';
  return 'Não foi possível entrar. Confira se E-mail/senha está ativado no Firebase.';
}

formularioLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  statusLogin.textContent = 'Verificando acesso...';
  botaoLogin.disabled = true;

  const dados = new FormData(formularioLogin);
  const email = String(dados.get('email') || '').trim();
  const senha = String(dados.get('senha') || '');
  const manterConectado = dados.get('manterLogado') === 'on';

  try {
    await setPersistence(auth, manterConectado ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.replace('index.html');
  } catch (erro) {
    console.error('Falha no login:', erro);
    statusLogin.textContent = mensagemDoErro(erro);
    botaoLogin.disabled = false;
  }
});
