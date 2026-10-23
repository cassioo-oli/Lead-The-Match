/* Painel com os registros privados da conta autenticada no Firebase. */
import { carregarRegistrosPrivados } from './firebase.js';

const filtroEquipe = document.getElementById('filtroEquipe');
const statusDados = document.getElementById('statusDados');
let scouts = [], pits = [], rankingChart, desempenhoChart, situacaoChart;

function normalizar(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function valor(linha, alternativas) {
  const pares = Object.entries(linha);
  for (const alternativa of alternativas) {
    const achado = pares.find(([chave]) => normalizar(chave) === normalizar(alternativa));
    if (achado?.[1]) return achado[1];
  }
  for (const alternativa of alternativas) {
    const alvo = normalizar(alternativa);
    const achado = pares.find(([chave]) => normalizar(chave).includes(alvo) || alvo.includes(normalizar(chave)));
    if (achado?.[1]) return achado[1];
  }
  return '';
}

function metadado(linha, rotulo) {
  const texto = valor(linha, ['observacoes', 'observações']);
  const padrao = new RegExp(rotulo + '\\s*:\\s*([^|]+)', 'i');
  return (texto.match(padrao)?.[1] || '').trim();
}
function equipe(linha) { return valor(linha, ['equipeNumero', 'selecaoEquipe', 'seleção_equipe', 'equipe avaliada', 'equipe']) || metadado(linha, 'Equipe'); }
function daEquipe(linhas, nome) { return linhas.filter(linha => normalizar(equipe(linha)) === normalizar(nome)); }
function media(valores) { const nums = valores.filter(Number.isFinite); return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null; }
function apagar(grafico) { if (grafico) grafico.destroy(); }
function vazio(id, mostra) { document.getElementById(id).hidden = !mostra; }
function textoSeguro(valor) { const span = document.createElement('span'); span.textContent = valor; return span.innerHTML; }

function graficoNotas() {
  const notasPorEquipe = new Map();
  scouts.forEach(linha => {
    const nome = equipe(linha);
    const textoNota = valor(linha, ['notaGeral', 'nota geral']) || metadado(linha, 'Nota geral');
    const nota = Number(textoNota);
    if (!nome || !textoNota || !Number.isFinite(nota)) return;
    if (!notasPorEquipe.has(nome)) notasPorEquipe.set(nome, []);
    notasPorEquipe.get(nome).push(nota);
  });
  const dados = [...notasPorEquipe].map(([nome, notas]) => ({ nome, nota: media(notas) })).sort((a, b) => b.nota - a.nota).slice(0, 12);
  apagar(rankingChart); vazio('vazioRanking', !dados.length); if (!dados.length) return;
  rankingChart = new Chart(document.getElementById('graficoRankingNotas'), {
    type: 'bar',
    data: { labels: dados.map(item => item.nome), datasets: [{ label: 'Nota média', data: dados.map(item => item.nota), backgroundColor: '#0866c6', borderRadius: 6 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 }, title: { display: true, text: 'Nota (1 a 5)' } }, x: { ticks: { maxRotation: 35 } } } }
  });
}

const criterios = [
  ['Autônomo', ['suave_alinhado'], ['erro_trajetoria']],
  ['Coleta', ['captura_veloz'], ['captura_lenta']],
  ['Encaixe', ['encaixe_preciso'], ['encaixe_tentativas']],
  ['Defesa', ['defesa_resistente'], ['defesa_evita_conforto', 'defesa_evita_confronto']],
  ['Escalada', ['escalada_rapida'], ['escalada_instavel']],
  ['Pilares', ['controle_bom', 'controle_pilares_bom'], ['controle_mediano', 'controle_pilares_mediano']]
];

function pontuarRegistro(linha, bons, medios) {
  if (bons.some(campo => valor(linha, [campo]))) return 2;
  if (medios.some(campo => valor(linha, [campo]))) return 1;
  const temRegistro = [...bons, ...medios].some(campo => valor(linha, [campo]));
  return temRegistro ? 0 : null;
}

function atualizarResumo(registros, nome) {
  const notas = registros.map(linha => valor(linha, ['notaGeral', 'nota geral']) || metadado(linha, 'Nota geral')).filter(Boolean).map(Number).filter(Number.isFinite);
  const estimativas = registros.map(linha => valor(linha, ['pontuacaoEstimada', 'pontuacao estimada']) || metadado(linha, 'Pontuação estimada')).filter(Boolean);
  const ordem = { baixa: 1, media: 2, alta: 3 };
  const maior = estimativas.sort((a, b) => (ordem[normalizar(b)] || 0) - (ordem[normalizar(a)] || 0))[0];
  document.getElementById('totalPartidas').textContent = registros.length || '—';
  document.getElementById('mediaNota').textContent = notas.length ? media(notas).toFixed(1).replace('.', ',') : '—';
  document.getElementById('maiorPontuacao').textContent = maior ? maior[0].toUpperCase() + maior.slice(1) : '—';
  document.getElementById('statusPit').textContent = daEquipe(pits, nome).length ? 'Feito ✓' : 'Pendente';
}

function atualizarPerfilPit(nome) {
  const area = document.getElementById('perfilPit'), resposta = daEquipe(pits, nome)[0];
  if (!resposta) { area.innerHTML = '<p class="pit-empty">Ainda não há Pit Scouting salvo para esta equipe.</p>'; return; }
  const campos = [
    ['Dimensões', ['dimensoesRobos', 'dimensoes_robos', 'quais sao as dimensoes do robo']],
    ['Pilares carregados', ['qntdMaxPilares', 'qntd_max_pilares', 'quantos pilares consegue carregar']],
    ['Passa no Fluxo', ['passagemEmbaixoFluxo', 'passagem_embaixo_fluxo', 'consegue passar embaixo do fluxo']],
    ['Coleta', ['ladosColeta', 'lados_coleta', 'de quais lados consegue coletar pilares']],
    ['Níveis de pontuação', ['niveisPontuacao', 'niveis_pontuacao', 'em quais niveis do mural consegue pontuar']],
    ['Escalada final', ['escaladaAoFinal', 'escalada_ao_final', 'consegue se pendurar no fluxo']],
    ['Modo de jogo', ['modoOperacional', 'modo_operacional', 'como o robo funciona na partida']],
    ['Motores e sensores', ['qntdMotoresSensores', 'qntd_motores_sensores', 'quantos motores e sensores possui']],
    ['Programação', ['linguagemProgramacao', 'linguagem_programação', 'qual programa ou linguagem foi usado']]
  ];
  area.innerHTML = campos.map(([titulo, chaves]) => `<article class="pit-data"><span>${titulo}</span><strong>${textoSeguro(valor(resposta, chaves) || 'Não informado')}</strong></article>`).join('');
}

function graficosEquipe(nome) {
  const registros = daEquipe(scouts, nome);
  const dados = criterios.map(([, bons, medios]) => media(registros.map(linha => pontuarRegistro(linha, bons, medios))));
  apagar(desempenhoChart); vazio('vazioDesempenho', !dados.some(item => item !== null));
  if (dados.some(item => item !== null)) desempenhoChart = new Chart(document.getElementById('graficoDesempenho'), {
    type: 'bar', data: { labels: criterios.map(([titulo]) => titulo), datasets: [{ data: dados.map(item => item ?? 0), backgroundColor: '#0866c6', borderRadius: 6 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.raw.toFixed(1)} de 2` } } }, scales: { y: { beginAtZero: true, max: 2, ticks: { stepSize: 1, callback: value => ['Atenção', 'Regular', 'Bom'][value] || value } } } }
  });
  const situacoes = { Apareceu: 0, Desabilitado: 0, Parado: 0, 'Problema no autônomo': 0 };
  registros.forEach(linha => {
    if (valor(linha, ['problemas_mecanicos'])) situacoes.Desabilitado += 1;
    else if (valor(linha, ['ausente_arena'])) situacoes.Parado += 1;
    else if (valor(linha, ['erro_trajetoria'])) situacoes['Problema no autônomo'] += 1;
    else if (valor(linha, ['pronta_arena'])) situacoes.Apareceu += 1;
  });
  apagar(situacaoChart); const temSituacoes = Object.values(situacoes).some(item => item > 0); vazio('vazioSituacao', !temSituacoes);
  if (temSituacoes) situacaoChart = new Chart(document.getElementById('graficoSituacao'), {
    type: 'bar', data: { labels: Object.keys(situacoes), datasets: [{ data: Object.values(situacoes), backgroundColor: ['#16853b', '#e2a000', '#d26045', '#b63c3c'], borderRadius: 6 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { maxRotation: 30 } } } }
  });
  atualizarResumo(registros, nome); atualizarPerfilPit(nome);
}

function preencherEquipes() {
  const equipes = [...new Set([...scouts, ...pits].map(equipe).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  filtroEquipe.innerHTML = '<option value="">Selecione uma equipe</option>' + equipes.map(nome => `<option value="${textoSeguro(nome)}">${textoSeguro(nome)}</option>`).join('');
  filtroEquipe.disabled = !equipes.length;
  if (!equipes.length) statusDados.textContent = 'Ainda não há Scout ou Pit Scout salvo nesta conta.';
}

async function iniciar() {
  try {
    [scouts, pits] = await Promise.all([
      carregarRegistrosPrivados('scouting'),
      carregarRegistrosPrivados('pitScout')
    ]);
    preencherEquipes(); graficoNotas();
    statusDados.textContent = `${scouts.length} Scout(s) e ${pits.length} Pit Scout(s) privados desta conta carregados.`;
  } catch (erro) {
    console.error(erro); statusDados.classList.add('error');
    statusDados.textContent = 'Não foi possível carregar seus dados. Confira se o Firestore foi criado e se as regras de acesso foram publicadas.';
  }
}

filtroEquipe.addEventListener('change', () => { if (filtroEquipe.value) graficosEquipe(filtroEquipe.value); });
iniciar();
