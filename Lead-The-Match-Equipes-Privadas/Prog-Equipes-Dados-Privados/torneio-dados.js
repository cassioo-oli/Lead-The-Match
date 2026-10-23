// Fonte única de dados do cronograma e dos resultados. A planilha é apenas lida.
export const URL_AGENDA = 'https://docs.google.com/spreadsheets/d/1SW3MyTRQzhMUCHjvXLhrdTijCCtq1yfgv6RAHdV9QYs/gviz/tq?tqx=out:csv&gid=2032908800';
export const URL_RESULTADOS = 'https://docs.google.com/spreadsheets/d/1PGOdUi3p0ZttiHlhkk3Il53ZvThFwsQfWqdoDPlXP0s/gviz/tq?tqx=out:csv&gid=1402051272';

export function normalizar(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s_]/g, '').toLowerCase();
}

export function campo(linha, nomes) {
  for (const nome of nomes) {
    const chave = Object.keys(linha).find(item => normalizar(item) === normalizar(nome));
    if (chave && linha[chave] !== '') return linha[chave];
  }
  return '';
}

function lerCsv(texto) {
  const linhas = []; let linha = [], valor = '', aspas = false;
  for (let i = 0; i < texto.length; i += 1) {
    const c = texto[i];
    if (c === '"') { if (aspas && texto[i + 1] === '"') { valor += '"'; i += 1; } else aspas = !aspas; }
    else if (c === ',' && !aspas) { linha.push(valor); valor = ''; }
    else if ((c === '\n' || c === '\r') && !aspas) {
      if (c === '\r' && texto[i + 1] === '\n') i += 1;
      linha.push(valor); if (linha.some(item => item.trim())) linhas.push(linha); linha = []; valor = '';
    } else valor += c;
  }
  linha.push(valor); if (linha.some(item => item.trim())) linhas.push(linha);
  const [cabecalhos = [], ...dados] = linhas;
  return dados.map(valores => Object.fromEntries(cabecalhos.map((cabecalho, i) => [cabecalho.trim(), (valores[i] || '').trim()])));
}

async function carregar(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Não foi possível abrir a planilha.');
  return lerCsv(await resposta.text());
}

export async function carregarAgenda() { return carregar(URL_AGENDA); }
export async function carregarResultados() { return carregar(URL_RESULTADOS); }
export function diaExibicao(dia = '') {
  const texto = String(dia).trim();
  if (texto === '29') return '27';
  if (texto === '30') return '28';
  return texto.replace(/(^|\D)29(?=\D|$)/, (todo, inicio) => inicio + '27').replace(/(^|\D)30(?=\D|$)/, (todo, inicio) => inicio + '28');
}
export function escaparHtml(valor = '') {
  return String(valor).replace(/[&<>"']/g, letra => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[letra]));
}
