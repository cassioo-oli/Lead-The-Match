// Envio do Scouting para o Google Forms já vinculado à planilha de respostas.
// Os IDs abaixo foram conferidos no formulário “Scouting”.
const FORM_SCOUTING = 'https://docs.google.com/forms/d/e/1FAIpQLSeQ1VNPsaOrbgSUA_GmVrbIh6FF22Tju2VRJ0M1c0ObnysQhw/formResponse';
const ENTRADAS = {
  pronta_arena: 'entry.548527385', problemas_mecanicos: 'entry.1631903070', ausente_arena: 'entry.1470083706',
  suave_alinhado: 'entry.50043006', erro_trajetoria: 'entry.185800376', nao_moveu: 'entry.1262585333',
  captura_veloz: 'entry.493412968', captura_lenta: 'entry.1747042119', captura_com_falhas: 'entry.613499521',
  coletaPrincipal_chao: 'entry.1321669003', coletaPrincipal_estation: 'entry.1221916007', coletaPrincipal_ambos: 'entry.1477377237',
  encaixe_preciso: 'entry.985192304', encaixe_tentativas: 'entry.876684342', encaixe_errado: 'entry.1814364822',
  foco_chao: 'entry.910923076', foco_n1: 'entry.750553193', foco_n2: 'entry.712148736', foco_n3: 'entry.1771611129', foco_indiferente: 'entry.1474818102',
  defesa_resistente: 'entry.781340509', defesa_facilmente_bloqueado: 'entry.1376113337', defesa_evita_confronto: 'entry.1419545685',
  escalada_rapida: 'entry.2127150915', escalada_instavel: 'entry.1235007462', escalada_nao_tentou: 'entry.2124004204',
  tentou_coop_sim: 'entry.1513343973', tentou_coop_nao: 'entry.1122210344',
  controle_pilares_bom: 'entry.861415626', controle_pilares_mediano: 'entry.161232139', controle_pilares_ruim: 'entry.1034300752',
  penalidade_vermelho: 'entry.22997062', penalidade_amarelo: 'entry.805744506', penalidade_nenhum: 'entry.1673712922',
  observacoes: 'entry.589172755', realizou_auto: 'entry.1771838545'
};

function adicionarEscolha(formData, valor, texto) {
  const entrada = ENTRADAS[valor];
  if (entrada) formData.append(entrada, texto);
}

function textoLimpo(valor) { return String(valor || '').replace(/[\n|]/g, ' ').trim(); }

document.getElementById('liveScoutForm').addEventListener('submit', async evento => {
  evento.preventDefault();
  evento.stopImmediatePropagation();
  const form = evento.currentTarget;
  const status = document.getElementById('liveScoutStatus');
  const dados = Object.fromEntries(new FormData(form));
  if (!dados.numeroJogo || !dados.equipeNumero) {
    status.textContent = 'Selecione a equipe avaliada antes de salvar.';
    return;
  }
  if (!livePosition) {
    status.textContent = 'Marque a posição inicial do robô na quadra antes de salvar.';
    return;
  }
  const resposta = new URLSearchParams();
  adicionarEscolha(resposta, { apareceu: 'pronta_arena', desabilitado: 'problemas_mecanicos', parado: 'ausente_arena', problema_autonomo: 'erro_trajetoria' }[dados.statusRobo], dados.statusRobo || '');
  adicionarEscolha(resposta, dados.comportamentoAuto, dados.comportamentoAuto || '');
  adicionarEscolha(resposta, dados.eficienciaColeta, dados.eficienciaColeta || '');
  adicionarEscolha(resposta, dados.origemColeta, dados.origemColeta || '');
  adicionarEscolha(resposta, dados.qualidadeEncaixe, dados.qualidadeEncaixe || '');
  adicionarEscolha(resposta, dados.focoPontuacao, dados.focoPontuacao || '');
  adicionarEscolha(resposta, dados.defesa, dados.defesa || '');
  adicionarEscolha(resposta, dados.escalada, dados.escalada || '');
  adicionarEscolha(resposta, dados.cooperacao, dados.cooperacao || '');
  adicionarEscolha(resposta, dados.controlePilares, dados.controlePilares || '');
  adicionarEscolha(resposta, dados.penalidade, dados.penalidade || '');
  adicionarEscolha(resposta, 'realizou_auto', dados.modoOperacao || '');
  const posicao = Math.round(livePosition.x) + '% horizontal, ' + Math.round(livePosition.y) + '% vertical' + (liveFieldInverted ? ' (quadra invertida)' : '');
  const metadados = [
    'Equipe: ' + textoLimpo(dados.equipeNumero),
    'Partida: ' + textoLimpo(dados.numeroJogo),
    'Nota geral: ' + textoLimpo(dados.notaGeral),
    'Pontuação estimada: ' + textoLimpo(dados.pontuacaoEstimada),
    'Posição inicial: ' + posicao,
    'Observações: ' + textoLimpo(dados.observacoes)
  ].join(' | ');
  resposta.append(ENTRADAS.observacoes, metadados);
  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  status.textContent = 'Enviando Scout para a planilha...';
  try {
    await fetch(FORM_SCOUTING, { method: 'POST', mode: 'no-cors', body: resposta });
    status.textContent = 'Scout enviado. Atualize Estatísticas em alguns segundos para ver o novo registro.';
    botao.textContent = 'Scout enviado ✓';
  } catch (erro) {
    console.error(erro);
    status.textContent = 'Não foi possível enviar. Verifique sua conexão e tente novamente.';
    botao.disabled = false;
  }
}, true);
