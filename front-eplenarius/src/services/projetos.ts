// Função para gerar IDs únicos sem depender do pacote uuid
const generateId = () => {
  return 'id_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '_' + Date.now().toString(36);
};

export interface Projeto {
  id: string;
  camaraId: string;
  numero: string;
  titulo: string;
  descricao: string;
  tipo: 'lei' | 'resolucao' | 'decreto' | 'emenda' | 'outro';
  autor: string;
  dataApresentacao: Date;
  situacao: 'tramitacao' | 'aprovado' | 'rejeitado' | 'arquivado';
  sessaoIds: string[]; // IDs das sessões onde o projeto foi ou será discutido
  anexos: string[]; // URLs ou base64 dos anexos
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const STORAGE_KEY = 'eplenarius_projetos';

// Inicializar localStorage com projetos de exemplo se estiver vazio
const initializeLocalStorage = () => {
  const projetos = localStorage.getItem(STORAGE_KEY);
  
  if (!projetos) {
    const dataAtual = new Date();
    const projetosExemplo: Projeto[] = [
      {
        id: generateId(),
        camaraId: '1',
        numero: '001/2023',
        titulo: 'Projeto de Lei para Revitalização do Centro Histórico',
        descricao: 'Projeto que visa a revitalização e preservação do patrimônio histórico do centro da cidade.',
        tipo: 'lei',
        autor: 'Vereador João Silva',
        dataApresentacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 30),
        situacao: 'tramitacao',
        sessaoIds: [],
        anexos: [],
        dataCriacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 30),
        dataAtualizacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 30)
      },
      {
        id: generateId(),
        camaraId: '1',
        numero: '002/2023',
        titulo: 'Projeto de Resolução para Alteração do Regimento Interno',
        descricao: 'Projeto que propõe alterações no regimento interno da Câmara Municipal.',
        tipo: 'resolucao',
        autor: 'Vereadora Maria Oliveira',
        dataApresentacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 20),
        situacao: 'aprovado',
        sessaoIds: [],
        anexos: [],
        dataCriacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 20),
        dataAtualizacao: new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate() - 15)
      }
    ];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projetosExemplo));
  }
};

// Inicializar localStorage
initializeLocalStorage();

// Função para converter datas de string para objeto Date
const convertDates = (projeto: any): Projeto => {
  return {
    ...projeto,
    dataApresentacao: new Date(projeto.dataApresentacao),
    dataCriacao: new Date(projeto.dataCriacao),
    dataAtualizacao: new Date(projeto.dataAtualizacao)
  };
};

// Obter todos os projetos
export const getProjetos = (): Projeto[] => {
  const projetos = localStorage.getItem(STORAGE_KEY);
  if (!projetos) return [];
  
  return JSON.parse(projetos).map(convertDates);
};

// Obter projetos por ID da câmara
export const getProjetosByCamaraId = (camaraId: string): Projeto[] => {
  const projetos = getProjetos();
  return projetos.filter(projeto => projeto.camaraId === camaraId);
};

// Obter projetos por ID da sessão
export const getProjetosBySessaoId = (sessaoId: string): Projeto[] => {
  const projetos = getProjetos();
  return projetos.filter(projeto => projeto.sessaoIds.includes(sessaoId));
};

// Obter projeto por ID
export const getProjetoById = (id: string): Projeto | null => {
  const projetos = getProjetos();
  const projeto = projetos.find(p => p.id === id);
  return projeto || null;
};

// Adicionar novo projeto
export const addProjeto = (projeto: Omit<Projeto, 'id' | 'dataCriacao' | 'dataAtualizacao'>): Projeto => {
  const projetos = getProjetos();
  
  const novoProjeto: Projeto = {
    ...projeto,
    id: generateId(),
    dataCriacao: new Date(),
    dataAtualizacao: new Date()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...projetos, novoProjeto]));
  
  return novoProjeto;
};

// Atualizar projeto existente
export const updateProjeto = (id: string, projetoAtualizado: Partial<Omit<Projeto, 'id' | 'dataCriacao'>>): Projeto | null => {
  const projetos = getProjetos();
  const index = projetos.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  const projetoAtual = projetos[index];
  const projetoModificado: Projeto = {
    ...projetoAtual,
    ...projetoAtualizado,
    dataAtualizacao: new Date()
  };
  
  projetos[index] = projetoModificado;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projetos));
  
  return projetoModificado;
};

// Excluir projeto
export const deleteProjeto = (id: string): boolean => {
  const projetos = getProjetos();
  const novosProjetos = projetos.filter(p => p.id !== id);
  
  if (novosProjetos.length === projetos.length) {
    return false;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novosProjetos));
  return true;
};

// Vincular projeto a uma sessão
export const vincularProjetoSessao = (projetoId: string, sessaoId: string): boolean => {
  const projetos = getProjetos();
  const index = projetos.findIndex(p => p.id === projetoId);
  
  if (index === -1) return false;
  
  const projeto = projetos[index];
  
  // Verificar se o projeto já está vinculado à sessão
  if (projeto.sessaoIds.includes(sessaoId)) {
    return true;
  }
  
  // Adicionar sessão à lista de sessões do projeto
  projeto.sessaoIds.push(sessaoId);
  projeto.dataAtualizacao = new Date();
  
  projetos[index] = projeto;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projetos));
  
  return true;
};

// Desvincular projeto de uma sessão
export const desvincularProjetoSessao = (projetoId: string, sessaoId: string): boolean => {
  const projetos = getProjetos();
  const index = projetos.findIndex(p => p.id === projetoId);
  
  if (index === -1) return false;
  
  const projeto = projetos[index];
  
  // Remover sessão da lista de sessões do projeto
  projeto.sessaoIds = projeto.sessaoIds.filter(id => id !== sessaoId);
  projeto.dataAtualizacao = new Date();
  
  projetos[index] = projeto;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projetos));
  
  return true;
};

// Obter projetos por situação
export const getProjetosBySituacao = (camaraId: string, situacao: Projeto['situacao']): Projeto[] => {
  const projetos = getProjetosByCamaraId(camaraId);
  return projetos.filter(projeto => projeto.situacao === situacao);
};

// Obter projetos por tipo
export const getProjetosByTipo = (camaraId: string, tipo: Projeto['tipo']): Projeto[] => {
  const projetos = getProjetosByCamaraId(camaraId);
  return projetos.filter(projeto => projeto.tipo === tipo);
}; 