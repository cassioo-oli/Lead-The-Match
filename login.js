const CHAVE_SESSAO = 'leadTheMatchSessao';
const usuariosDeTeste = [{ usuario: 'teste', senha: 'lead2026', equipe: 'Conta de teste', teste: true }];
const formularioLogin = document.getElementById('loginForm');
const statusLogin = document.getElementById('loginStatus');
function salvarSessao(sessao, manter) { const destino = manter ? localStorage : sessionStorage; localStorage.removeItem(CHAVE_SESSAO); sessionStorage.removeItem(CHAVE_SESSAO); destino.setItem(CHAVE_SESSAO, JSON.stringify(sessao)); }
function sessaoExistente() { try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_SESSAO) || 'null'); } catch { return null; } }
if (sessaoExistente()) window.location.replace('index.html');
formularioLogin.addEventListener('submit', evento => {
  evento.preventDefault();
  const dados = new FormData(formularioLogin), usuario = String(dados.get('usuario')).trim().toLowerCase(), senha = String(dados.get('senha'));
  const conta = usuariosDeTeste.find(item => item.usuario === usuario && item.senha === senha);
  if (!conta) { statusLogin.textContent = 'Usuário ou senha inválidos. Use a conta de teste enquanto os acessos das equipes não forem configurados.'; return; }
  salvarSessao({ usuario: conta.usuario, equipe: conta.equipe, teste: true }, dados.get('manterLogado') === 'on');
  window.location.href = 'index.html';
});
