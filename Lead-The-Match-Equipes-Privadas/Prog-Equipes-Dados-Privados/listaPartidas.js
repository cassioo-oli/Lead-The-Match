import { carregarAgenda, carregarResultados, campo, diaExibicao, escaparHtml, normalizar } from './torneio-dados.js';

const tabela = document.getElementById('ltmTabelaPartidas');
const busca = document.getElementById('ltmBuscaPartida');
const status = document.getElementById('ltmStatusPartidas');
let partidas = [], filtro = 'todos';

function agruparPartidas(agenda, resultados) {
  const resultadosPorJogo = new Map();
  resultados.forEach(linha => {
    const jogo = String(campo(linha, ['selecao_numero_jogo', 'numeroJogo'])).trim();
    const equipe = String(campo(linha, ['selecao_da_equipe', 'equipe'])).trim();
    if (!jogo || !equipe || normalizar(equipe) === 'equipetreino') return;
    if (!resultadosPorJogo.has(jogo)) resultadosPorJogo.set(jogo, new Set());
    resultadosPorJogo.get(jogo).add(equipe);
  });
  const mapa = new Map();
  agenda.forEach(linha => {
    const numero = String(campo(linha, ['numeroJogo', 'numero jogo'])).trim();
    const equipe = String(campo(linha, ['equipe'])).trim();
    if (!numero) return;
    if (!mapa.has(numero)) mapa.set(numero, { numero, dia: campo(linha, ['dia']), horario: campo(linha, ['horario']), equipes: [] });
    const partida = mapa.get(numero);
    if (equipe && !partida.equipes.includes(equipe)) partida.equipes.push(equipe);
  });
  const concluidos = [...mapa.values()].filter(item => (resultadosPorJogo.get(item.numero)?.size || 0) >= 2).map(item => Number(item.numero));
  const ultimo = concluidos.length ? Math.max(...concluidos) : 0;
  return [...mapa.values()].sort((a, b) => Number(a.numero) - Number(b.numero)).map(item => ({ ...item, status: (resultadosPorJogo.get(item.numero)?.size || 0) >= 2 ? 'completo' : Number(item.numero) === ultimo + 1 ? 'proximo' : Number(item.numero) <= ultimo + 6 ? 'fila' : 'pendente' }));
}

function textoStatus(chave) { return { completo: 'Completo', proximo: 'Próximo', fila: 'Fila', pendente: 'Pendente' }[chave]; }
function urlScout(partida) { return 'scout.html?' + new URLSearchParams({ partida: partida.numero, equipe1: partida.equipes[0], equipe2: partida.equipes[1] }); }

function renderizar() {
  const termo = normalizar(busca.value);
  const lista = partidas.filter(partida => {
    const texto = normalizar([partida.numero, partida.dia, partida.horario, ...partida.equipes].join(' '));
    return (filtro === 'todos' || partida.status === 'proximo' || partida.status === 'fila') && texto.includes(termo);
  });
  tabela.innerHTML = lista.length ? lista.map(partida => {
    const confronto = partida.equipes.length >= 2 ? escaparHtml(partida.equipes[0]) + '<span class="match-vs">×</span>' + escaparHtml(partida.equipes[1]) : partida.equipes.map(escaparHtml).join(', ');
    const botao = partida.equipes.length >= 2 ? '<a class="scout-match-button" href="' + urlScout(partida) + '">Fazer Scout</a>' : '—';
    return '<tr><td class="match-number">' + escaparHtml(partida.numero) + '</td><td>' + escaparHtml(diaExibicao(partida.dia)) + '</td><td>' + escaparHtml(partida.horario) + '</td><td class="match-teams">' + confronto + '</td><td><span class="match-status status-' + partida.status + '">' + textoStatus(partida.status) + '</span></td><td>' + botao + '</td></tr>';
  }).join('') : '<tr><td colspan="6" class="schedule-empty">Nenhuma partida encontrada.</td></tr>';
}

async function iniciar() {
  try {
    const dados = await Promise.all([carregarAgenda(), carregarResultados()]);
    partidas = agruparPartidas(dados[0], dados[1]);
    status.textContent = partidas.length + ' partidas carregadas. Dias 29 e 30 são exibidos como 27 e 28 nesta página.';
    renderizar();
  } catch (erro) {
    console.error(erro); status.textContent = 'Não foi possível carregar o cronograma. Confira se as planilhas estão liberadas para leitura.';
  }
}
busca.addEventListener('input', renderizar);
document.querySelectorAll('[data-ltm-filtro]').forEach(botao => botao.addEventListener('click', () => { filtro = botao.dataset.ltmFiltro; document.querySelectorAll('[data-ltm-filtro]').forEach(item => item.classList.toggle('active', item === botao)); renderizar(); }));
iniciar();
