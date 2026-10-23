const PIT_SCOUTING_CONFIG = {
  formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSexjTDJQg-aUw4UaAanb875GelYSN5diiSfEtWUU25s-69JrQ/formResponse",

  entries: {
    selecaoEquipe: "entry.374853149",
    dimensoesRobos: "entry.122721752",
    qntdMaxPilares: "entry.1767374720",
    passagemEmbaixoFluxo: "entry.1731125261",
    ladosColeta: "entry.1734846866",
    estilosColeta: "entry.1841533399",
    niveisPontuacao: "entry.388317656",
    escaladaAoFinal: "entry.659269404",
    equipamentoRobo: "entry.1269496313",
    qntdMotoresSensores: "entry.1132384212",
    modoOperacional: "entry.532614598",
    linguagemProgramacao: "entry.737569850"
  }
};

const pitForm = document.getElementById("pitForm");
const statusMsg = document.getElementById("statusMsg");

const CHAVE_EQUIPES_CONCLUIDAS = "leadTheMatchPitScoutConcluidoV2";
const CHAVE_DADOS_PIT = "leadTheMatchPitScoutDadosV2";
const CHAVE_LIMPEZA_TESTES = "leadTheMatchPitScoutTestesLimposV1";
const CAMPOS_RESUMO = [
  ["dimensoesRobos", "Dimensões do robô"],
  ["qntdMaxPilares", "Pilares que consegue carregar"],
  ["passagemEmbaixoFluxo", "Passa embaixo do Fluxo"],
  ["ladosColeta", "Lados de coleta"],
  ["estilosColeta", "Mecanismo de coleta"],
  ["niveisPontuacao", "Níveis de pontuação"],
  ["escaladaAoFinal", "Consegue se pendurar no Fluxo"],
  ["equipamentoRobo", "Materiais usados"],
  ["qntdMotoresSensores", "Motores e sensores"],
  ["modoOperacional", "Modo de jogo"],
  ["linguagemProgramacao", "Programa ou linguagem"]
];

// Remove somente as marcações e resumos de teste que ficaram neste navegador.
// As respostas já enviadas ao Google Forms não são apagadas.
function limparDadosDeTesteAntigos() {
  if (localStorage.getItem(CHAVE_LIMPEZA_TESTES)) return;
  localStorage.removeItem("leadTheMatchPitScoutConcluido");
  localStorage.removeItem("leadTheMatchPitScoutDados");
  localStorage.setItem(CHAVE_LIMPEZA_TESTES, "sim");
}

// Lê as equipes já concluídas no navegador.
function lerEquipesConcluidas() {
  try {
    const dados = localStorage.getItem(CHAVE_EQUIPES_CONCLUIDAS);

    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    return [];
  }
}

// Salva uma equipe como concluída.
function salvarEquipeConcluida(nomeEquipe) {
  const equipes = lerEquipesConcluidas();

  if (!equipes.includes(nomeEquipe)) {
    equipes.push(nomeEquipe);

    localStorage.setItem(
      CHAVE_EQUIPES_CONCLUIDAS,
      JSON.stringify(equipes)
    );
  }
}

function lerDadosPit() {
  try { return JSON.parse(localStorage.getItem(CHAVE_DADOS_PIT) || "{}"); }
  catch (erro) { return {}; }
}

function salvarDadosPit(nomeEquipe, dados) {
  const dadosPorEquipe = lerDadosPit();
  dadosPorEquipe[nomeEquipe] = dados;
  localStorage.setItem(CHAVE_DADOS_PIT, JSON.stringify(dadosPorEquipe));
}

function escaparHtml(valor) {
  const elemento = document.createElement("span");
  elemento.textContent = valor || "Não informado";
  return elemento.innerHTML;
}

function mostrarResumoPit(nomeEquipe) {
  const dados = lerDadosPit()[nomeEquipe];
  if (!dados) return;
  document.getElementById("tituloResumoPit").textContent = "Informações: " + nomeEquipe;
  document.getElementById("dadosResumoPit").innerHTML = CAMPOS_RESUMO.map(([campo, titulo]) =>
    '<article class="pit-resumo-item"><strong>' + titulo + '</strong><span>' + escaparHtml(dados[campo]) + '</span></article>'
  ).join("");
  document.getElementById("selecao-equipe").classList.add("escondido");
  document.getElementById("formulario-pit").classList.add("escondido");
  document.getElementById("dados-enviados").classList.add("escondido");
  document.getElementById("resumo-pit").classList.remove("escondido");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Pinta um botão específico de azul.
function pintarEquipeComoConcluida(nomeEquipe) {
  document.querySelectorAll(".pit-equipe").forEach((botao) => {
    if (botao.dataset.equipe === nomeEquipe) {
      botao.classList.add("concluida");
    }
  });
}

// Quando a página abre, pinta todas as equipes já salvas.
function carregarMarcacoesDasEquipes() {
  const equipes = lerEquipesConcluidas();

  equipes.forEach((nomeEquipe) => {
    pintarEquipeComoConcluida(nomeEquipe);
  });
}

// Converte os dados do HTML para o formato do Google Forms.
function criarDadosDoFormulario(dados) {
  const formData = new URLSearchParams();

  Object.entries(dados).forEach(([campo, valor]) => {
    const entry = PIT_SCOUTING_CONFIG.entries[campo];

    if (entry) {
      formData.append(entry, valor);
    }
  });

  return formData;
}

// Envia as respostas ao Google Forms.
async function enviarParaGoogleForms(dados) {
  const formData = criarDadosDoFormulario(dados);

  await fetch(PIT_SCOUTING_CONFIG.formUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}

// Envia quando clicar no botão "Carregar dados".
pitForm.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const botaoEnviar = pitForm.querySelector('button[type="submit"]');
  const dados = Object.fromEntries(new FormData(pitForm));

  botaoEnviar.disabled = true;
  statusMsg.textContent = "Enviando dados...";

  try {
    await enviarParaGoogleForms(dados);

    // Salva e pinta a equipe somente após a tentativa de envio.
    salvarEquipeConcluida(dados.selecaoEquipe);
    salvarDadosPit(dados.selecaoEquipe, dados);
    pintarEquipeComoConcluida(dados.selecaoEquipe);

    document.getElementById("nomeEquipeEnviada").textContent =
      dados.selecaoEquipe;

    pitForm.reset();
    statusMsg.textContent = "";

    document.getElementById("formulario-pit").classList.add("escondido");
    document.getElementById("dados-enviados").classList.remove("escondido");

  } catch (erro) {
    console.error(erro);
    statusMsg.textContent = "Erro ao enviar. Tente novamente.";
  } finally {
    botaoEnviar.disabled = false;
  }
});

// Executa assim que o JavaScript carregar.
limparDadosDeTesteAntigos();
carregarMarcacoesDasEquipes();

// Ao abrir uma equipe já concluída, mostra um resumo das informações,
// sem reabrir o formulário de perguntas.
document.getElementById("listaEquipes").addEventListener("click", (evento) => {
  const botao = evento.target.closest(".pit-equipe");
  if (!botao || !lerDadosPit()[botao.dataset.equipe]) return;
  evento.stopImmediatePropagation();
  mostrarResumoPit(botao.dataset.equipe);
}, true);

document.getElementById("voltarDoResumo").addEventListener("click", () => {
  document.getElementById("resumo-pit").classList.add("escondido");
  document.getElementById("selecao-equipe").classList.remove("escondido");
  window.scrollTo({ top: 0, behavior: "smooth" });
});
