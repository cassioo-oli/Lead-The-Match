import { carregarRegistrosPrivados, salvarRegistroPrivado } from './firebase.js';

const pitForm = document.getElementById('pitForm');
const statusMsg = document.getElementById('statusMsg');
const statusPitConta = document.getElementById('statusPitConta');
const dadosPorEquipe = new Map();

const CAMPOS_RESUMO = [
  ['dimensoesRobos', 'Dimensões do robô'],
  ['qntdMaxPilares', 'Pilares que consegue carregar'],
  ['passagemEmbaixoFluxo', 'Passa embaixo do Fluxo'],
  ['ladosColeta', 'Lados de coleta'],
  ['estilosColeta', 'Mecanismo de coleta'],
  ['niveisPontuacao', 'Níveis de pontuação'],
  ['escaladaAoFinal', 'Consegue se pendurar no Fluxo'],
  ['equipamentoRobo', 'Materiais usados'],
  ['qntdMotoresSensores', 'Motores e sensores'],
  ['modoOperacional', 'Modo de jogo'],
  ['linguagemProgramacao', 'Programa ou linguagem']
];

function escaparHtml(valor) {
  const elemento = document.createElement('span');
  elemento.textContent = valor || 'Não informado';
  return elemento.innerHTML;
}

function pintarEquipeComoConcluida(nomeEquipe) {
  document.querySelectorAll('.pit-equipe').forEach((botao) => {
    if (botao.dataset.equipe === nomeEquipe) botao.classList.add('concluida');
  });
}

function carregarResumo(nomeEquipe) {
  const dados = dadosPorEquipe.get(nomeEquipe);
  if (!dados) return;
  document.getElementById('tituloResumoPit').textContent = 'Informações: ' + nomeEquipe;
  document.getElementById('dadosResumoPit').innerHTML = CAMPOS_RESUMO.map(([campo, titulo]) =>
    '<article class="pit-resumo-item"><strong>' + titulo + '</strong><span>' + escaparHtml(dados[campo]) + '</span></article>'
  ).join('');
  document.getElementById('selecao-equipe').classList.add('escondido');
  document.getElementById('formulario-pit').classList.add('escondido');
  document.getElementById('dados-enviados').classList.add('escondido');
  document.getElementById('resumo-pit').classList.remove('escondido');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarPitScoutDaConta() {
  try {
    const registros = await carregarRegistrosPrivados('pitScout');
    registros.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0));
    registros.forEach((registro) => {
      const nomeEquipe = registro.selecaoEquipe;
      if (nomeEquipe && !dadosPorEquipe.has(nomeEquipe)) {
        dadosPorEquipe.set(nomeEquipe, registro);
        pintarEquipeComoConcluida(nomeEquipe);
      }
    });
    statusPitConta.textContent = registros.length
      ? 'Seus registros de Pit Scout foram carregados.'
      : 'Ainda não há Pit Scouts salvos nesta conta.';
  } catch (erro) {
    console.error('Falha ao carregar os Pit Scouts da conta:', erro);
    statusPitConta.textContent = 'Não foi possível carregar seus registros. Confira se o Firestore foi configurado.';
  }
}

pitForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const botaoEnviar = pitForm.querySelector('button[type="submit"]');
  const dados = Object.fromEntries(new FormData(pitForm));
  botaoEnviar.disabled = true;
  statusMsg.textContent = 'Salvando com segurança na sua conta...';

  try {
    const registro = await salvarRegistroPrivado('pitScout', dados);
    dadosPorEquipe.set(dados.selecaoEquipe, registro);
    pintarEquipeComoConcluida(dados.selecaoEquipe);
    statusPitConta.textContent = 'Pit Scout de ' + dados.selecaoEquipe + ' salvo nesta conta.';
    document.getElementById('nomeEquipeEnviada').textContent = dados.selecaoEquipe;
    pitForm.reset();
    statusMsg.textContent = '';
    document.getElementById('formulario-pit').classList.add('escondido');
    document.getElementById('dados-enviados').classList.remove('escondido');
  } catch (erro) {
    console.error('Falha ao salvar o Pit Scout:', erro);
    statusMsg.textContent = 'Não foi possível salvar. Confira sua conexão e as regras do Firestore.';
  } finally {
    botaoEnviar.disabled = false;
  }
});

document.getElementById('listaEquipes').addEventListener('click', (evento) => {
  const botao = evento.target.closest('.pit-equipe');
  if (!botao || !dadosPorEquipe.has(botao.dataset.equipe)) return;
  evento.stopImmediatePropagation();
  carregarResumo(botao.dataset.equipe);
}, true);

document.getElementById('voltarDoResumo').addEventListener('click', () => {
  document.getElementById('resumo-pit').classList.add('escondido');
  document.getElementById('selecao-equipe').classList.remove('escondido');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

carregarPitScoutDaConta();
