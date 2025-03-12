// Serviço para gerenciar votações de vereadores em projetos
import { generateId } from './utils';

// Tipos de voto possíveis
export type TipoVoto = 'favoravel' | 'contrario' | 'abstencao' | null;

// Interface para o voto
export interface Voto {
  id: string;
  sessaoId: string;
  projetoId: string;
  vereadorId: string;
  voto: TipoVoto;
  dataVoto: Date;
}

// Interface para o resultado da votação
export interface ResultadoVotacao {
  sim: number;
  nao: number;
  abstencao: number;
  naoVotaram: number;
  total: number;
  aprovado: boolean | null;
}

// Chave para armazenamento no localStorage
const VOTOS_STORAGE_KEY = 'e-plenarius:votos';

// Inicializa o localStorage com dados vazios se necessário
export function initializeLocalStorage() {
  if (!localStorage.getItem(VOTOS_STORAGE_KEY)) {
    localStorage.setItem(VOTOS_STORAGE_KEY, JSON.stringify([]));
  }
}

// Inicializa o localStorage quando o módulo é carregado
initializeLocalStorage();

// Função para obter todos os votos
export function getAllVotos(): Voto[] {
  const votosJson = localStorage.getItem(VOTOS_STORAGE_KEY);
  const votos = votosJson ? JSON.parse(votosJson) : [];
  
  // Converter datas de string para Date
  return votos.map((voto: any) => ({
    ...voto,
    dataVoto: new Date(voto.dataVoto)
  }));
}

// Função para salvar todos os votos
function saveVotos(votos: Voto[]) {
  localStorage.setItem(VOTOS_STORAGE_KEY, JSON.stringify(votos));
}

// Função para obter votos por sessão e projeto
export function getVotosBySessaoAndProjeto(sessaoId: string, projetoId: string): Voto[] {
  const votos = getAllVotos();
  return votos.filter(voto => voto.sessaoId === sessaoId && voto.projetoId === projetoId);
}

// Função para obter o voto de um vereador em um projeto específico
export function getVotoByVereadorAndProjeto(sessaoId: string, projetoId: string, vereadorId: string): Voto | undefined {
  const votos = getAllVotos();
  return votos.find(voto => 
    voto.sessaoId === sessaoId && 
    voto.projetoId === projetoId && 
    voto.vereadorId === vereadorId
  );
}

// Função para registrar ou atualizar o voto de um vereador
export function registrarVotoVereador(
  sessaoId: string, 
  projetoId: string, 
  vereadorId: string, 
  voto: TipoVoto
): Promise<Voto> {
  return new Promise((resolve) => {
    const votos = getAllVotos();
    
    // Verificar se o vereador já votou neste projeto
    const votoExistente = votos.find(v => 
      v.sessaoId === sessaoId && 
      v.projetoId === projetoId && 
      v.vereadorId === vereadorId
    );
    
    let votoAtualizado: Voto;
    
    if (votoExistente) {
      // Atualizar voto existente
      votoExistente.voto = voto;
      votoExistente.dataVoto = new Date();
      votoAtualizado = votoExistente;
    } else {
      // Criar novo voto
      votoAtualizado = {
        id: generateId(),
        sessaoId,
        projetoId,
        vereadorId,
        voto,
        dataVoto: new Date()
      };
      votos.push(votoAtualizado);
    }
    
    saveVotos(votos);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(() => resolve(votoAtualizado), 300);
  });
}

// Função para limpar todos os votos de um projeto
export function limparVotosProjeto(sessaoId: string, projetoId: string): Promise<void> {
  return new Promise((resolve) => {
    const votos = getAllVotos();
    const votosAtualizados = votos.filter(voto => 
      !(voto.sessaoId === sessaoId && voto.projetoId === projetoId)
    );
    
    saveVotos(votosAtualizados);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(resolve, 300);
  });
}

// Função para calcular o resultado da votação
export function calcularResultadoVotacao(
  sessaoId: string, 
  projetoId: string, 
  totalVereadores: number
): ResultadoVotacao {
  const votos = getVotosBySessaoAndProjeto(sessaoId, projetoId);
  
  const sim = votos.filter(voto => voto.voto === 'favoravel').length;
  const nao = votos.filter(voto => voto.voto === 'contrario').length;
  const abstencao = votos.filter(voto => voto.voto === 'abstencao').length;
  const naoVotaram = totalVereadores - sim - nao - abstencao;
  
  // Determinar se o projeto foi aprovado (maioria simples)
  // null significa que a votação ainda não foi concluída
  let aprovado: boolean | null = null;
  
  // Se todos já votaram ou se abstiveram, podemos determinar o resultado
  if (naoVotaram === 0) {
    aprovado = sim > nao;
  }
  
  return {
    sim,
    nao,
    abstencao,
    naoVotaram,
    total: totalVereadores,
    aprovado
  };
}

// Compatibilidade com o código existente
export const registrarVoto = registrarVotoVereador;
export const getVotoVereador = getVotoByVereadorAndProjeto;
export const getResultadoVotacao = (sessaoId: string, projetoId: string) => {
  const votos = getVotosBySessaoAndProjeto(sessaoId, projetoId);
  
  const favoraveis = votos.filter(v => v.voto === 'favoravel').length;
  const contrarios = votos.filter(v => v.voto === 'contrario').length;
  const abstencoes = votos.filter(v => v.voto === 'abstencao').length;
  
  return { favoraveis, contrarios, abstencoes };
}; 