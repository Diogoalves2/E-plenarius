// Definindo a interface para a sessão
export interface Sessao {
  id: string;
  camaraId: string;
  titulo: string;
  tipo: 'ordinaria' | 'extraordinaria' | 'solene' | 'especial';
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  descricao: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  projetosIds: string[]; // IDs dos projetos que serão discutidos na sessão
  ata: string;
  dataCriacao: Date;
  vereadoresPresentes: string[]; // IDs dos vereadores presentes
}

// Chave para armazenar as sessões no localStorage
const SESSOES_STORAGE_KEY = '@EPlenarius:sessoes';

// Função para gerar um ID único
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Função para inicializar o localStorage com sessões de exemplo
export const initializeLocalStorage = () => {
  const sessoes = localStorage.getItem(SESSOES_STORAGE_KEY);
  
  if (!sessoes) {
    const dataAtual = new Date();
    const sessoesExemplo: Sessao[] = [
      {
        id: generateId(),
        camaraId: '1',
        titulo: 'Sessão Ordinária 001/2023',
        tipo: 'ordinaria',
        data: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() + 7),
        horaInicio: '14:00',
        horaFim: '17:00',
        local: 'Plenário Principal',
        descricao: 'Sessão ordinária para discussão de projetos pendentes.',
        status: 'agendada',
        projetosIds: [],
        ata: '',
        dataCriacao: new Date(),
        vereadoresPresentes: []
      },
      {
        id: generateId(),
        camaraId: '1',
        titulo: 'Sessão Extraordinária 002/2023',
        tipo: 'extraordinaria',
        data: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 15),
        horaInicio: '10:00',
        horaFim: '12:00',
        local: 'Plenário Principal',
        descricao: 'Sessão extraordinária para votação de projetos urgentes.',
        status: 'realizada',
        projetosIds: [],
        ata: 'Ata da sessão extraordinária realizada em...',
        dataCriacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 20),
        vereadoresPresentes: []
      }
    ];
    
    localStorage.setItem(SESSOES_STORAGE_KEY, JSON.stringify(sessoesExemplo));
  } else {
    // Verifica se as sessões existentes têm o campo vereadoresPresentes
    const sessoesJson = localStorage.getItem(SESSOES_STORAGE_KEY);
    if (sessoesJson) {
      const sessoes = JSON.parse(sessoesJson);
      let atualizou = false;
      
      sessoes.forEach((sessao: any) => {
        if (!sessao.vereadoresPresentes) {
          sessao.vereadoresPresentes = [];
          atualizou = true;
        }
      });
      
      if (atualizou) {
        localStorage.setItem(SESSOES_STORAGE_KEY, JSON.stringify(sessoes));
      }
    }
  }
};

// Inicializar localStorage
initializeLocalStorage();

// Função para converter datas de string para Date
const convertDates = (sessoes: any[]): Sessao[] => {
  return sessoes.map(sessao => ({
    ...sessao,
    data: new Date(sessao.data),
    dataCriacao: new Date(sessao.dataCriacao)
  }));
};

// Função para obter todas as sessões
export const getAllSessoes = (): Sessao[] => {
  const sessoesJson = localStorage.getItem(SESSOES_STORAGE_KEY) || '[]';
  const sessoes = JSON.parse(sessoesJson);
  return convertDates(sessoes);
};

// Função para salvar todas as sessões
export const saveSessoes = (sessoes: Sessao[]): void => {
  localStorage.setItem(SESSOES_STORAGE_KEY, JSON.stringify(sessoes));
};

// Função para obter as sessões de uma câmara específica
export const getSessoesByCamaraId = (camaraId: string): Sessao[] => {
  const sessoes = getAllSessoes();
  return sessoes.filter(sessao => sessao.camaraId === camaraId);
};

// Função para obter uma sessão pelo ID
export const getSessaoById = (sessaoId: string): Sessao | null => {
  try {
    const sessoesStr = localStorage.getItem(SESSOES_STORAGE_KEY);
    if (!sessoesStr) return null;
    
    const sessoes: Sessao[] = JSON.parse(sessoesStr);
    return sessoes.find(sessao => sessao.id === sessaoId) || null;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

// Função para obter uma sessão pelo ID e câmara ID (compatibilidade)
export const getSessaoByCamaraId = (camaraId: string, sessaoId: string): Sessao | null => {
  return getSessaoById(sessaoId);
};

// Função para adicionar uma nova sessão
export const addSessao = async (sessao: Omit<Sessao, 'id' | 'dataCriacao'>): Promise<Sessao> => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sessoes = getAllSessoes();
  
  const novaSessao: Sessao = {
    ...sessao,
    id: generateId(),
    dataCriacao: new Date(),
    vereadoresPresentes: []
  };
  
  sessoes.push(novaSessao);
  saveSessoes(sessoes);
  
  return novaSessao;
};

// Função para atualizar uma sessão
export const updateSessao = async (sessao: Sessao): Promise<Sessao> => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sessoes = getAllSessoes();
  const index = sessoes.findIndex(s => s.id === sessao.id);
  
  if (index === -1) {
    throw new Error('Sessão não encontrada');
  }
  
  sessoes[index] = sessao;
  saveSessoes(sessoes);
  
  return sessao;
};

// Função para excluir uma sessão
export const deleteSessao = async (id: string): Promise<void> => {
  // Simular atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const sessoes = getAllSessoes();
  const novasSessoes = sessoes.filter(sessao => sessao.id !== id);
  
  saveSessoes(novasSessoes);
};

// Função para obter as próximas sessões de uma câmara
export const getProximasSessoes = (camaraId: string): Sessao[] => {
  const sessoes = getSessoesByCamaraId(camaraId);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  return sessoes
    .filter(sessao => {
      const dataSessao = new Date(sessao.data);
      dataSessao.setHours(0, 0, 0, 0);
      return dataSessao >= hoje && sessao.status !== 'cancelada';
    })
    .sort((a, b) => a.data.getTime() - b.data.getTime());
};

// Função para obter as sessões passadas de uma câmara
export const getSessoesPassadas = (camaraId: string): Sessao[] => {
  const sessoes = getSessoesByCamaraId(camaraId);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  return sessoes
    .filter(sessao => {
      const dataSessao = new Date(sessao.data);
      dataSessao.setHours(0, 0, 0, 0);
      return dataSessao < hoje || sessao.status === 'realizada' || sessao.status === 'cancelada';
    })
    .sort((a, b) => b.data.getTime() - a.data.getTime()); // Ordem decrescente (mais recentes primeiro)
};

// Função para registrar presença de vereador na sessão
export const registrarPresencaVereador = (sessaoId: string, vereadorId: string): Promise<Sessao> => {
  return new Promise((resolve, reject) => {
    try {
      const sessoes = getAllSessoes();
      const sessao = sessoes.find(s => s.id === sessaoId);
      
      if (!sessao) {
        reject(new Error('Sessão não encontrada'));
        return;
      }
      
      // Inicializa o array se não existir
      if (!sessao.vereadoresPresentes) {
        sessao.vereadoresPresentes = [];
      }
      
      // Adiciona o vereador se ele ainda não estiver na lista
      if (!sessao.vereadoresPresentes.includes(vereadorId)) {
        sessao.vereadoresPresentes.push(vereadorId);
        saveSessoes(sessoes);
      }
      
      // Simula um pequeno atraso para parecer uma operação assíncrona real
      setTimeout(() => resolve(sessao), 300);
    } catch (error) {
      reject(error);
    }
  });
};

// Função para remover presença de vereador na sessão
export const removerPresencaVereador = (sessaoId: string, vereadorId: string): Promise<Sessao> => {
  return new Promise((resolve, reject) => {
    try {
      const sessoes = getAllSessoes();
      const sessao = sessoes.find(s => s.id === sessaoId);
      
      if (!sessao) {
        reject(new Error('Sessão não encontrada'));
        return;
      }
      
      // Inicializa o array se não existir
      if (!sessao.vereadoresPresentes) {
        sessao.vereadoresPresentes = [];
      } else {
        // Remove o vereador da lista
        sessao.vereadoresPresentes = sessao.vereadoresPresentes.filter(id => id !== vereadorId);
        saveSessoes(sessoes);
      }
      
      // Simula um pequeno atraso para parecer uma operação assíncrona real
      setTimeout(() => resolve(sessao), 300);
    } catch (error) {
      reject(error);
    }
  });
};

// Função para obter os vereadores presentes em uma sessão
export const getVereadoresPresentesBySessaoId = (sessaoId: string): string[] => {
  const sessao = getSessaoById(sessaoId);
  if (!sessao) return [];
  
  // Inicializa o array se não existir
  if (!sessao.vereadoresPresentes) {
    sessao.vereadoresPresentes = [];
    
    // Atualiza a sessão no localStorage
    const sessoes = getAllSessoes();
    const index = sessoes.findIndex(s => s.id === sessaoId);
    if (index !== -1) {
      sessoes[index].vereadoresPresentes = [];
      saveSessoes(sessoes);
    }
  }
  
  return sessao.vereadoresPresentes;
}; 