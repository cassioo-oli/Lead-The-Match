import { salvarRegistroPrivado } from './firebase.js';

const statusPorCampo = {
  apareceu: 'pronta_arena',
  desabilitado: 'problemas_mecanicos',
  parado: 'ausente_arena',
  problema_autonomo: 'erro_trajetoria'
};

function mapearEscolha(dados, campo) {
  const escolhido = dados[campo];
  return escolhido ? { [escolhido]: escolhido } : {};
}

document.getElementById('liveScoutForm').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  evento.stopImmediatePropagation();

  const formulario = evento.currentTarget;
  const status = document.getElementById('liveScoutStatus');
  const botao = formulario.querySelector('button[type="submit"]');
  const dados = Object.fromEntries(new FormData(formulario));
  const posicaoMarcada = window.livePosition;

  if (!dados.numeroJogo || !dados.equipeNumero) {
    status.textContent = 'Selecione uma partida e a equipe avaliada antes de salvar.';
    return;
  }
  if (!posicaoMarcada) {
    status.textContent = 'Marque a posição inicial do robô na quadra antes de salvar.';
    return;
  }

  const registro = {
    ...dados,
    numeroJogo: String(dados.numeroJogo),
    equipeNumero: dados.equipeNumero,
    posicaoInicial: {
      x: Math.round(posicaoMarcada.x),
      y: Math.round(posicaoMarcada.y),
      quadraInvertida: Boolean(window.liveFieldInverted)
    },
    ...(dados.statusRobo ? { [statusPorCampo[dados.statusRobo]]: dados.statusRobo } : {}),
    ...mapearEscolha(dados, 'comportamentoAuto'),
    ...mapearEscolha(dados, 'eficienciaColeta'),
    ...mapearEscolha(dados, 'origemColeta'),
    ...mapearEscolha(dados, 'qualidadeEncaixe'),
    ...mapearEscolha(dados, 'focoPontuacao'),
    ...mapearEscolha(dados, 'escalada'),
    ...mapearEscolha(dados, 'cooperacao'),
    ...mapearEscolha(dados, 'controlePilares'),
    ...mapearEscolha(dados, 'penalidade')
  };

  botao.disabled = true;
  status.textContent = 'Salvando o Scout nos dados privados desta conta...';
  try {
    await salvarRegistroPrivado('scouting', registro);
    status.textContent = 'Scout salvo nesta conta. Você pode registrar outro robô.';
    botao.textContent = 'Scout salvo ✓';
  } catch (erro) {
    console.error('Falha ao salvar o Scout:', erro);
    status.textContent = 'Não foi possível salvar. Confira a conexão e as regras do Firestore.';
    botao.disabled = false;
  }
});
