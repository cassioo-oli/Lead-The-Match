import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';

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
export const db = getFirestore(app);

const colecoesPrivadas = new Set(['scouting', 'pitScout']);

function aguardarUsuario() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve, reject) => {
    let parar = null;
    parar = onAuthStateChanged(auth, (usuario) => {
      if (parar) parar();
      if (usuario) resolve(usuario);
      else reject(new Error('Faça login para acessar seus dados.'));
    }, reject);
  });
}

async function obterColecaoPrivada(nome) {
  if (!colecoesPrivadas.has(nome)) throw new Error('Coleção de dados inválida.');
  const usuario = await aguardarUsuario();
  return collection(db, 'users', usuario.uid, nome);
}

export async function salvarRegistroPrivado(nome, dados) {
  const registro = { ...dados, criadoEm: serverTimestamp() };
  const referencia = await addDoc(await obterColecaoPrivada(nome), registro);
  return { id: referencia.id, ...dados };
}

export async function carregarRegistrosPrivados(nome) {
  const resposta = await getDocs(await obterColecaoPrivada(nome));
  return resposta.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}
