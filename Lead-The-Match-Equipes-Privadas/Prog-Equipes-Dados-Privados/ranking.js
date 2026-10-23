// ranking.js
// Cálculo puro do ranking das qualificatórias a partir das linhas da planilha
// de respostas do Google Forms (mesma fonte usada pelo cronograma).
//
// Regras:
//  - "Equipe Treino" é ignorada (não é uma equipe real).
//  - Dedupe por (equipe, jogo): se houver reenvio para o mesmo jogo, vence o
//    de carimbo de data/hora mais recente.
//  - Pontos individuais = n1 + n2 + n3 + chão + escalada.
//  - Pontos de cooperação = pontos_de_cooperacao.
//  - Total = individuais + cooperação (mesma base do gráfico, para que
//    a ordenação e os números exibidos sejam sempre consistentes).
//  - Médias = somas / número de jogos daquela equipe.
//  - Ordenação (desempate): média de pontos → média individuais → média coop.

export function normKey(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s_]/g, '').toLowerCase();
}

export function campo(obj, nome) {
  const alvo = normKey(nome);
  for (const k of Object.keys(obj || {})) {
    if (normKey(k) === alvo) return obj[k];
  }
  return '';
}

export function isEquipeTreino(nome) {
  return normKey(nome) === 'equipetreino';
}

function num(v) {
  return Number(v || 0) || 0;
}

function parseCarimbo(ts) {
  if (!ts) return 0;
  const m = String(ts).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  if (!m) return 0;
  const [, d, mo, y, h, mi, s] = m;
  return new Date(+y, +mo - 1, +d, +h, +mi, +(s || 0)).getTime();
}

export function calcularRanking(linhas) {
  // 1) dedupe por (equipe, jogo) mantendo o envio mais recente
  const porEquipeJogo = {};
  (linhas || []).forEach(item => {
    const equipe = String(campo(item, 'selecao_da_equipe')).trim();
    const jogo = String(campo(item, 'selecao_numero_jogo')).trim();
    if (!equipe || !jogo) return;
    if (isEquipeTreino(equipe)) return; // ignora equipe de treino
    const key = normKey(equipe) + '#' + jogo;
    const ts = parseCarimbo(campo(item, 'Carimbo de data/hora'));
    if (!porEquipeJogo[key] || ts >= porEquipeJogo[key].ts) {
      porEquipeJogo[key] = { item, ts, equipe };
    }
  });

  // 2) agrega por equipe
  const agg = {};
  Object.values(porEquipeJogo).forEach(({ item, equipe }) => {
    const k = normKey(equipe);
    if (!agg[k]) agg[k] = { nome: equipe, jogos: 0, somaTotal: 0, somaInd: 0, somaCoop: 0 };
    const coop = num(campo(item, 'pontos_de_cooperacao'));
    const ind = num(campo(item, 'pts_individuais_n1'))
      + num(campo(item, 'pts_individuais_n2'))
      + num(campo(item, 'pts_individuais_n3'))
      + num(campo(item, 'pts_individuais_chao'))
      + num(campo(item, 'escalada'));
    const total = ind + coop;
    const a = agg[k];
    a.jogos++;
    a.somaTotal += total;
    a.somaInd += ind;
    a.somaCoop += coop;
  });

  // 3) calcula médias e ordena
  const lista = Object.values(agg).map(a => ({
    nome: a.nome,
    jogos: a.jogos,
    mediaTotal: a.somaTotal / a.jogos,
    mediaInd: a.somaInd / a.jogos,
    mediaCoop: a.somaCoop / a.jogos
  }));

  lista.sort((x, y) =>
    (y.mediaTotal - x.mediaTotal) ||
    (y.mediaInd - x.mediaInd) ||
    (y.mediaCoop - x.mediaCoop) ||
    x.nome.localeCompare(y.nome)
  );

  return lista;
}
