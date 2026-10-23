import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';

// A configuração do app Web é pública. A segurança dos dados depende das
// regras do Firebase e das permissões dos serviços, não de esconder este bloco.
const firebaseConfig = {
  apiKey: 'AIzaSyBpCKslxy_66QKoVA_3jy8ehs0nStY97yk',
  authDomain: 'lead-the-match.firebaseapp.com',
  projectId: 'lead-the-match',
  storageBucket: 'lead-the-match.firebasestorage.app',
  messagingSenderId: '690535885315',
  appId: '1:690535885315:web:45af24aa546c5a17d17c36'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
