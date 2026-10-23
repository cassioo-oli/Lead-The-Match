import { carregarResultados, campo, normalizar, escaparHtml } from './torneio-dados.js';

const corpo = document.getElementById('rankingBody');
const status = document.getElementById('rankingStatus');
function numero(valor) { return Number(valor || 0) || 0; }

function calcularRanking(linhas) {
  const ultimos = new Map();
  linhas.forEach(linha => {
    const equipe = String(campo(linha, ['selecao_da_equipe', 'equipe'])).trim();
    const jogo = String(campo(linha, ['selecao_numero_jogo', 'numeroJogo'])).trim();
    if (!equipe || !jogo || normalizar(equipe) === 'equipetreino') return;
    const data = String(campo(linha, ['Carimbo de data/hora'])).trim();
    const chave = normalizar(equipe) + '#' + jogo;
    if (!ultimos.has(chave) || data >= ultimos.get(chave).data) ultimos.set(chave, { linha, equipe, data });
  });
  const times = new Map();
  ultimos.forEach(({ linha, equipe }) => {
    const chave = normalizar(equipe);
    if (!times.has(chave)) times.set(chave, { equipe, jogos: 0, total: 0, individual: 0, cooperacao: 0 });
    const individual = numero(campo(linha, ['pts_individuais_n1'])) + numero(campo(linha, ['pts_individuais_n2'])) + numero(campo(linha, ['pts_individuais_n3'])) + numero(campo(linha, ['pts_individuais_chao'])) + numero(campo(linha, ['escalada']));
    const cooperacao = numero(campo(linha, ['pontos_de_cooperacao']));
    const time = times.get(chave); time.jogos += 1; time.individual += individual; time.cooperacao += cooperacao; time.total += individual + cooperacao;
  });
  return [...times.values()].map(time => ({ nome: time.equipe, jogos: time.jogos, total: time.total / time.jogos, individual: time.individual / time.jogos, cooperacao: time.cooperacao / time.jogos })).sort((a, b) => b.total - a.total || b.individual - a.individual || b.cooperacao - a.cooperacao || a.nome.localeCompare(b.nome));
}
function formatar(valor) { return valor.toFixed(1).replace('.', ','); }
function renderizar(lista) {
  corpo.innerHTML = lista.length ? lista.map((time, i) => '<tr><td class="rank-pos">' + (i + 1) + 'º</td><td class="rank-team">' + escaparHtml(time.nome) + '</td><td class="rank-number rank-total">' + formatar(time.total) + '</td><td class="rank-number">' + formatar(time.individual) + '</td><td class="rank-number">' + formatar(time.cooperacao) + '</td></tr>').join('') : '<tr><td colspan="5" class="ranking-empty">Nenhum resultado registrado ainda.</td></tr>';
}
async function iniciar() {
  try {
    const lista = calcularRanking(await carregarResultados());
    renderizar(lista); status.textContent = lista.length + ' equipes classificadas com resultados registrados.';
  } catch (erro) {
    console.error(erro); status.textContent = 'Não foi possível carregar o ranking. Confira se a planilha de resultados está liberada para leitura.';
  }
}
iniciar();
