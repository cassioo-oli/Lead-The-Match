import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';

document.documentElement.classList.add('auth-pending');
document.documentElement.style.visibility = 'hidden';

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    window.location.replace('login.html');
    return;
  }

  document.documentElement.classList.remove('auth-pending');
  document.documentElement.style.visibility = '';
  const areaNavegacao = document.querySelector('.nav-content') || document.querySelector('.app-header') || document.querySelector('nav');
  if (!areaNavegacao || document.getElementById('authActions')) return;

  const area = document.createElement('div');
  area.id = 'authActions';
  area.className = 'auth-actions';

  const identificacao = document.createElement('span');
  identificacao.className = 'auth-email';
  identificacao.textContent = usuario.email || 'Equipe conectada';

  const sair = document.createElement('button');
  sair.className = 'auth-logout';
  sair.type = 'button';
  sair.textContent = 'Sair';
  sair.addEventListener('click', async () => {
    sair.disabled = true;
    try {
      await signOut(auth);
      window.location.replace('login.html');
    } catch (erro) {
      console.error('Não foi possível sair da conta:', erro);
      sair.disabled = false;
    }
  });

  area.append(identificacao, sair);
  areaNavegacao.append(area);
});
