const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, { id, hidden: false, textContent: '', innerHTML: '', value: '', classList: { add() {} }, addEventListener(type, cb) { this[type] = cb; } });
  return elements.get(id);
}
for (const [message, canvas] of [['vazioRanking','graficoRankingNotas'],['vazioDesempenho','graficoDesempenho'],['vazioSituacao','graficoSituacao']]) element(message).parentElement = { querySelector: () => element(canvas) };
const charts = new Map();
const data = {
  scouting: [
    { equipeNumero: 'Equipe Teste', notaGeral: '5', captura_veloz: 'captura_veloz', suave_alinhado: 'suave_alinhado', pronta_arena: 'apareceu', defesa_resistente: 'legado' },
    { equipeNumero: 'Equipe Teste', notaGeral: '3', captura_com_falhas: 'captura_com_falhas', pronta_arena: 'apareceu' }
  ],
  pitScout: [{ selecaoEquipe: 'Somente Pit', dimensoesRobos: 'Resposta longa de teste' }]
};
const context = vm.createContext({ console, document: {
  getElementById: element,
  createElement() { return { textContent: '', get innerHTML() { return String(this.textContent).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); } }; }
}, Chart: class { constructor(target, config) { this.target = target; charts.set(target.id, config); } destroy() { charts.delete(this.target.id); } }, carregarRegistrosPrivados: async name => data[name] });
const script = fs.readFileSync(path.join(root, 'estatisticas.js'), 'utf8').replace(/^import .*;\r?\n/m, '');
vm.runInContext(script, context);

(async () => {
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(element('vazioRanking').hidden, true);
  assert.equal(element('graficoRankingNotas').hidden, false);
  assert.equal(element('vazioDesempenho').hidden, false);
  element('filtroEquipe').value = 'Equipe Teste'; element('filtroEquipe').change();
  assert.equal(element('vazioDesempenho').hidden, true);
  const performance = charts.get('graficoDesempenho').data;
  assert.equal(performance.labels.includes('Defesa'), false);
  assert.equal(performance.datasets[0].data[1], 1, 'falha na coleta conta como zero na média');
  assert.equal(performance.datasets[0].data[2], null, 'não preencher não conta como zero');
  assert.equal(element('mediaNota').textContent, '4,0');
  element('filtroEquipe').value = 'Somente Pit'; element('filtroEquipe').change();
  assert.equal(element('vazioDesempenho').hidden, false);
  assert.equal(element('graficoDesempenho').hidden, true);
  assert.match(element('perfilPit').innerHTML, /Resposta longa de teste/);
  element('filtroEquipe').value = ''; element('filtroEquipe').change();
  assert.equal(element('totalPartidas').textContent, '—');
  assert.match(element('perfilPit').innerHTML, /Escolha uma equipe/);
  const css = fs.readFileSync(path.join(root,'estatisticas.css'),'utf8');
  assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'scout.html'),'utf8'), /name="defesa"/);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'scouting-envio.js'),'utf8'), /mapearEscolha\(dados, 'defesa'\)/);
  console.log('PASSOU: estados vazio/preenchido/Pit, seleção limpa, defesa removida, média e nota ausente.');
})().catch(error => { console.error(error); process.exitCode = 1; });
