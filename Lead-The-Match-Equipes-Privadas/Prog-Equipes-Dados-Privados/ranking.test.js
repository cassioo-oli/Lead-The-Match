// ranking.test.js
// Teste do cálculo de ranking. Rode com:  node ranking.test.js
// (ou:  npm test  nesta pasta)

import { calcularRanking } from './ranking.js';

let passou = 0;
let falhou = 0;

function ok(cond, msg) {
  if (cond) { passou++; console.log(`  ✅ ${msg}`); }
  else { falhou++; console.error(`  ❌ ${msg}`); }
}

// Helper para montar uma linha da planilha (chaves como vêm do Google Forms).
function linha({ jogo, equipe, n1 = 0, n2 = 0, n3 = 0, chao = 0, escalada = 0, coop = 0, total, ts = '' }) {
  const l = {
    'Carimbo de data/hora': ts,
    'selecao_numero_jogo': String(jogo),
    'selecao_da_equipe': equipe,
    'pts_individuais_n1': n1,
    'pts_individuais_n2': n2,
    'pts_individuais_n3': n3,
    'pts_individuais_chao': chao,
    'escalada': escalada,
    'pontos_de_cooperacao': coop,
  };
  if (total !== undefined) l['pts_totais'] = total;
  return l;
}

console.log('\n▶ Teste 1: médias por equipe e exclusão da Equipe Treino');
{
  // Time A: 2 jogos -> ind (10, 20) média 15; coop (4, 6) média 5; total (14, 26) média 20
  // Time B: 1 jogo  -> ind 30; coop 0; total 30
  // Equipe Treino: deve ser ignorada
  const linhas = [
    linha({ jogo: 1, equipe: 'Time A', n1: 10, coop: 4, total: 14 }),
    linha({ jogo: 2, equipe: 'Time A', n1: 20, coop: 6, total: 26 }),
    linha({ jogo: 1, equipe: 'Time B', n1: 30, coop: 0, total: 30 }),
    linha({ jogo: 2, equipe: 'Equipe Treino', n1: 99, coop: 99, total: 198 }),
  ];
  const r = calcularRanking(linhas);
  ok(r.length === 2, 'Equipe Treino excluída (2 equipes no ranking)');
  ok(r[0].nome === 'Time B', '1º é Time B (média de pontos 30 > 20)');
  ok(r[0].mediaTotal === 30, 'Time B média total = 30');
  ok(r[1].nome === 'Time A', '2º é Time A');
  ok(r[1].mediaTotal === 20, 'Time A média total = 20');
  ok(r[1].mediaInd === 15, 'Time A média individuais = 15');
  ok(r[1].mediaCoop === 5, 'Time A média cooperação = 5');
}

console.log('\n▶ Teste 2: desempate (média total igual -> individuais -> cooperação)');
{
  // Todos com média total 20:
  //  X: ind 20, coop 0
  //  Y: ind 15, coop 5
  //  Z: ind 15, coop 5 mesmo ind, mesma coop de Y -> desempate alfabético
  const linhas = [
    linha({ jogo: 1, equipe: 'Y', n1: 15, coop: 5, total: 20 }),
    linha({ jogo: 1, equipe: 'X', n1: 20, coop: 0, total: 20 }),
    linha({ jogo: 1, equipe: 'Z', n1: 15, coop: 5, total: 20 }),
  ];
  const r = calcularRanking(linhas);
  ok(r[0].nome === 'X', '1º é X (maior média individuais no empate de total)');
  ok(r[1].nome === 'Y', '2º é Y (empate total+coop com Z, ordem alfabética)');
  ok(r[2].nome === 'Z', '3º é Z');
}

console.log('\n▶ Teste 3: dedupe por (equipe, jogo) mantém o envio mais recente');
{
  // Mesmo time, mesmo jogo, enviado 2x -> vale o carimbo mais recente (total 50)
  const linhas = [
    linha({ jogo: 1, equipe: 'Time C', n1: 10, total: 10, ts: '01/01/2026 10:00:00' }),
    linha({ jogo: 1, equipe: 'Time C', n1: 50, total: 50, ts: '01/01/2026 10:05:00' }),
  ];
  const r = calcularRanking(linhas);
  ok(r.length === 1, 'apenas 1 equipe');
  ok(r[0].jogos === 1, 'conta como 1 jogo (não duplica)');
  ok(r[0].mediaTotal === 50, 'usa o envio mais recente (50)');
}

console.log('\n▶ Teste 4: total é sempre individuais + cooperação (ignora pts_totais divergente)');
{
  // pts_totais divergente (999) deve ser ignorado: total = 5+5+10 = 20
  const linhas = [
    linha({ jogo: 1, equipe: 'Time D', n1: 5, n2: 5, coop: 10, total: 999 }),
  ];
  const r = calcularRanking(linhas);
  ok(r[0].mediaTotal === 20, 'total = 5+5+10 = 20 (pts_totais 999 ignorado)');
  ok(r[0].mediaInd === 10, 'individuais = 10');
  ok(r[0].mediaCoop === 10, 'cooperação = 10');
  ok(r[0].mediaTotal === r[0].mediaInd + r[0].mediaCoop, 'total == individuais + cooperação');
}

console.log('\n▶ Teste 4b: ordenação usa a mesma base do gráfico (ind+coop)');
{
  // Antes do fix, um pts_totais menor rebaixava o time apesar de ind+coop maior.
  // P: ind 16, coop 2 -> total 18   (pts_totais "errado" = 16)
  // Q: ind 8,  coop 8 -> total 16
  const linhas = [
    linha({ jogo: 1, equipe: 'Q', n1: 8, coop: 8, total: 16 }),
    linha({ jogo: 1, equipe: 'P', n1: 16, coop: 2, total: 16 }),
  ];
  const r = calcularRanking(linhas);
  ok(r[0].nome === 'P', '1º é P (total 18 > 16), coerente com o número exibido');
  ok(r[0].mediaTotal === 18, 'P total = 18');
  ok(r[1].nome === 'Q', '2º é Q (total 16)');
}

console.log('\n▶ Teste 5: lista vazia');
{
  ok(calcularRanking([]).length === 0, 'sem linhas -> ranking vazio');
  ok(calcularRanking(undefined).length === 0, 'undefined -> ranking vazio');
}

console.log(`\n────────────────────────────`);
console.log(`Resultado: ${passou} passou, ${falhou} falhou`);
if (falhou > 0) process.exit(1);
