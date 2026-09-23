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

const CHAVE_EQUIPES_CONCLUIDAS = "leadTheMatchPitScoutConcluido";

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
carregarMarcacoesDasEquipes();