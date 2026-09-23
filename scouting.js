import { carregarSheetData } from "../sheets-to-website/sheetUtils.js";

// ============================================================================
// 1. CONFIGURAÇÃO UNIFICADA DO FORMULÁRIO DE SCOUTING QUALITATIVO
// ============================================================================
const SCOUTING_CONFIG = {
    sheetUrl: "https://docs.google.com/spreadsheets/d/1DUigeN8H8qIZgLjLZLcWIelAOz0kkLfRk2O410kX0fM/edit?resourcekey=&gid=495786815#gid=495786815",
    formUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeQ1VNPsaOrbgSUA_GmVrbIh6FF22Tju2VRJ0M1c0ObnysQhw/viewform?usp=publish-editor",
    
    // Mapeamento exclusivo de perguntas qualitativas por seção
    entries: {
        // --- PRÉ-PARTIDA ---
        pronta_arena: 'entry.XXXXXX_PRE_PRESENCA',
        problemas_mecanicos: 'entry.XXXXXX_PRE_PROBLEMAS_MECANICOS',
        ausente_arena: 'entry.XXXXXX_PRE_AUSENTE_ARENA',    
        suave_alinhado: 'entry.XXXXXX_PRE_SUAVE_ALINHADO',

        // --- DURANTE A PARTIDA ---
        suave_alinhado: 'entry.XXXXXX_DURANTE_COMPORTAMENTO_AUTO',
        erro_trajetoria: 'entry.XXXXXX_DURANTE_ERRO_TRAJETORIA',
        perdeu_carga: 'entry.XXXXXX_DURANTE_PERDEU_CARGA',
        nao_moveu: 'entry.XXXXXX_DURANTE_NAO_MOVEU',
        captura_veloz: 'entry.XXXXXX_DURANTE_CAPTURA_VELOZ',
        captura_lenta: 'entry.XXXXXX_DURANTE_CAPTURA_LENDA',
        captura_com_falhas: 'entry.XXXXXX_DURANTE_CAPTURA_COM_FALHAS',
        coletaPrincipal_chao: 'entry.XXXXXX_DURANTE_COLETA_PRINCIPAL_CHAO',
        coletaPrincipal_estation: 'entry.XXXXXX_DURANTE_COLETA_PRINCIPAL_ESTATION',
        coletaPrincipal_ambos: 'entry.XXXXXX_DURANTE_COLETA_PRINCIPAL_AMBOS',
        encaixe_preciso: 'entry.XXXXXX_DURANTE_ENCAIXE_PRECISO',
        encaixe_tentativas: 'entry.XXXXXX_DURANTE_ENCAIXE_TENTATIVAS',
        encaixe_errado: 'entry.XXXXXX_DURANTE_ENCAIXE_ERRADO',
        foco_n1: 'entry.XXXXXX_DURANTE_FOCO_N1',
        foco_n2: 'entry.XXXXXX_DURANTE_FOCO_N2',
        foco_n3: 'entry.XXXXXX_DURANTE_FOCO_N3',
        foco_chao: 'entry.XXXXXX_DURANTE_FOCO_CHAO',
        foco_indiferente: 'entry.XXXXXX_DURANTE_FOCO_INDIFFERENTE',
        defesa_resistente: 'entry.XXXXXX_DURANTE_DEFESA_RESISTENTE',
        defesa_facilmente_bloqueado: 'entry.XXXXXX_DURANTE_DEFESA_FACILMENTE_BLOQUEADO',
        defesa_evita_confronto: 'entry.XXXXXX_DURANTE_DEFESA_EVITA_CONFRONTO',
        escalada_rapida: 'entry.XXXXXX_DURANTE_ESCALADA_RAPIDA',
        escalada_instavel: 'entry.XXXXXX_DURANTE_ESCALADA_INSTAVEL',
        escalada_nao_tentou: 'entry.XXXXXX_DURANTE_ESCALADA_NAO_TENTOU',

        // --- PÓS-PARTIDA ---
        coleta_excelente: 'entry.XXXXXX_DURANTE_COLETA_EXCELENTE',
        coleta_mediana: 'entry.XXXXXX_DURANTE_COLETA_MEDIANA',
        coleta_ruim: 'entry.XXXXXX_DURANTE_COLETA_RUIM',
        escalada_fluida: 'entry.XXXXXX_DURANTE_ESCALADA_FLUIDA',
        escalada_naofluida: 'entry.XXXXXX_DURANTE_ESCALADA_NAOFLUIDA',
        tentou_coop_sim: 'entry.XXXXXX_DURANTE_TENTOU_COOP_SIM',
        tentou_coop_nao: 'entry.XXXXXX_DURANTE_TENTOU_COOP_NAO',
        realizou_auto_sim: 'entry.XXXXXX_DURANTE_REALIZOU_AUTO_SIM',
        realizou_auto_nao: 'entry.XXXXXX_DURANTE_REALIZOU_AUTO_NAO',
        desempenho_auto_consistente: 'entry.XXXXXX_DURANTE_DESEMPENHO_AUTO_CONSISTENTE',
        desempenho_auto_inconsistente: 'entry.XXXXXX_DURANTE_DESEMPENHO_AUTO_INCONSISTENTE',
        encaixe_pilar_bom: 'entry.XXXXXX_DURANTE_ENCAIXE_PILAR_BOM',
        encaixe_pilar_mediano: 'entry.XXXXXX_DURANTE_ENCAIXE_PILAR_MEDIANO',
        encaixe_pilar_ruim: 'entry.XXXXXX_DURANTE_ENCAIXE_PILAR_RUIM',
        controle_pilares_bom: 'entry.XXXXXX_DURANTE_CONTROLE_PILARES_BOM',
        controle_pilares_mediano: 'entry.XXXXXX_DURANTE_CONTROLE_PILARES_MEDIANO',
        controle_pilares_ruim: 'entry.XXXXXX_DURANTE_CONTROLE_PILARES_RUIM',
        robo_desconectou: 'entry.XXXXXX_DURANTE_ROBO_DESCONECTOU',
        robo_naodesconectou: 'entry.XXXXXX_DURANTE_ROBO_NAODESCONECTOU',
        penalidade_vermelho: 'entry.XXXXXX_DURANTE_PENALIDADE_VERMELHO',
        penalidade_amarelo: 'entry.XXXXXX_DURANTE_PENALIDADE_AMARELO',
        penalidade_nenhum:  'entry.XXXXXX_DURANTE_PENALIDADE_NENHUM',
        observações: 'entry.XXXXXX_DURANTE_OBSERVACOES'
    }
};

// ============================================================================
// 2. LÓGICA DE SUBMISSÃO VIA FETCH
// ============================================================================
function converterParaFormData(entriesMap, dados) {
    const formData = new URLSearchParams();
    Object.keys(dados).forEach(campo => {
        if (entriesMap[campo] !== undefined && dados[campo] !== undefined) {
            formData.append(entriesMap[campo], dados[campo]);
        }
    });
    return formData;
}

export async function enviarScoutingQualitativo(dadosPartida) {
    try {
        const formData = converterParaFormData(SCOUTING_CONFIG.entries, dadosPartida);
        await fetch(SCOUTING_CONFIG.formUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        console.log("✅ Formulário qualitativo enviado com sucesso!");
        return true;
    } catch (erro) {
        console.error("❌ Erro ao enviar formulário qualitativo:", erro);
        return false;
    }
}

// ============================================================================
// 3. CARREGAMENTO E LEITURA DA INTERFACE
// ============================================================================
const selectJogo = document.getElementById('selectJogo');
const btnBuscar = document.getElementById('btnBuscar');
const statusMsg = document.getElementById('statusMsg');

let matchesQuali = {};

function normalizarChave(str) { 
    return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); 
}

function getFlex(row, alvo) { 
    if (!row) return '';
    const n = normalizarChave(alvo); 
    for (const k of Object.keys(row)) { 
        if (normalizarChave(k) === n) return row[k]; 
    } 
    return '';
}

async function carregarDadosPlanilha() {
    const rawData = await carregarSheetData(SCOUTING_CONFIG.sheetUrl);
    return consolidarDados(rawData);
}

function consolidarDados(dadosPlanilha) {
    const jogos = {};

    if (Array.isArray(dadosPlanilha)) {
        dadosPlanilha.forEach(linha => {
            const numero = (getFlex(linha, 'numeroJogo') || getFlex(linha, 'Número de jogo') || '').toString().trim();
            const equipe = (getFlex(linha, 'equipeNumero') || getFlex(linha, 'Equipe') || '').toString().trim();

            if (!numero || !equipe) return;

            if (!jogos[numero]) jogos[numero] = [];
            jogos[numero].push(linha);
        });
    }

    const matches = {};
    Object.keys(jogos).forEach(num => {
        if (jogos[num].length >= 2) {
            matches[num] = {
                numero: num,
                equipeA: jogos[num][0],
                equipeB: jogos[num][1]
            };
        }
    });

    return matches;
}

function renderJogo(match) {
    const nomeA = getFlex(match.equipeA, 'equipeNumero') || getFlex(match.equipeA, 'Equipe') || '(sem nome)';
    const nomeB = getFlex(match.equipeB, 'equipeNumero') || getFlex(match.equipeB, 'Equipe') || '(sem nome)';
    
    if (document.getElementById('nomeEquipeA')) document.getElementById('nomeEquipeA').textContent = nomeA;
    if (document.getElementById('nomeEquipeB')) document.getElementById('nomeEquipeB').textContent = nomeB;
}

async function carregar() {
    if (!statusMsg) return;
    statusMsg.textContent = 'Carregando dados...';
    try {
        matchesQuali = await carregarDadosPlanilha();
        const numeros = Object.keys(matchesQuali).sort((a, b) => Number(a) - Number(b));

        if (selectJogo) {
            selectJogo.innerHTML = '<option value="">Selecione o jogo</option>';
            numeros.forEach(n => { 
                const opt = document.createElement('option'); 
                opt.value = n; 
                opt.textContent = n; 
                selectJogo.appendChild(opt); 
            });

            selectJogo.disabled = false; 
        }
        if (btnBuscar) btnBuscar.disabled = false;
        statusMsg.textContent = numeros.length ? `${numeros.length} jogo(s) carregado(s).` : 'Nenhum jogo encontrado.';
    } catch (err) {
        statusMsg.textContent = 'Erro ao carregar dados: ' + err;
    }
}

if (btnBuscar) {
    btnBuscar.addEventListener('click', () => {
        const num = selectJogo.value; 
        if (!num) return;
        renderJogo(matchesQuali[num]);
    });
}

carregar();