import { generateId } from './utils';

// Interface para o vereador
export interface Vereador {
  id: string;
  camaraId: string;
  nome: string;
  partido: string;
  cargo: 'presidente' | 'vice-presidente' | '1-secretario' | '2-secretario' | 'vereador';
  email: string;
  telefone: string;
  biografia?: string;
  foto?: string;
  dataCriacao: Date;
}

// Chave para armazenamento no localStorage
const VEREADORES_STORAGE_KEY = 'e-plenarius:vereadores';

// Inicializa o localStorage com dados de exemplo se necessário
export function initializeLocalStorage() {
  if (!localStorage.getItem(VEREADORES_STORAGE_KEY)) {
    const vereadoresIniciais: Vereador[] = [
      {
        id: '1',
        camaraId: '1',
        nome: 'João Silva',
        partido: 'PSD',
        cargo: 'presidente',
        email: 'joao.silva@camara.gov.br',
        telefone: '(11) 99999-9999',
        biografia: 'Presidente da Câmara Municipal, em seu terceiro mandato como vereador.',
        foto: '',
        dataCriacao: new Date('2023-01-01')
      },
      {
        id: '2',
        camaraId: '1',
        nome: 'Maria Oliveira',
        partido: 'PT',
        cargo: 'vice-presidente',
        email: 'maria.oliveira@camara.gov.br',
        telefone: '(11) 88888-8888',
        biografia: 'Vice-Presidente da Câmara Municipal, em seu segundo mandato como vereadora.',
        foto: '',
        dataCriacao: new Date('2023-01-01')
      },
      {
        id: '3',
        camaraId: '1',
        nome: 'Pedro Santos',
        partido: 'MDB',
        cargo: '1-secretario',
        email: 'pedro.santos@camara.gov.br',
        telefone: '(11) 77777-7777',
        biografia: '1º Secretário da Câmara Municipal, em seu primeiro mandato como vereador.',
        foto: '',
        dataCriacao: new Date('2023-01-01')
      },
      {
        id: '4',
        camaraId: '1',
        nome: 'Ana Souza',
        partido: 'PSDB',
        cargo: '2-secretario',
        email: 'ana.souza@camara.gov.br',
        telefone: '(11) 66666-6666',
        biografia: '2º Secretário da Câmara Municipal, em seu primeiro mandato.',
        foto: '',
        dataCriacao: new Date('2023-01-01')
      },
      {
        id: '5',
        camaraId: '1',
        nome: 'Carlos Ferreira',
        partido: 'PP',
        cargo: 'vereador',
        email: 'carlos.ferreira@camara.gov.br',
        telefone: '(11) 55555-5555',
        biografia: 'Vereador em seu segundo mandato.',
        foto: '',
        dataCriacao: new Date('2023-01-01')
      }
    ];
    
    localStorage.setItem(VEREADORES_STORAGE_KEY, JSON.stringify(vereadoresIniciais));
  }
}

// Inicializa o localStorage quando o módulo é carregado
initializeLocalStorage();

// Função para obter todos os vereadores
export function getAllVereadores(): Vereador[] {
  const vereadoresJson = localStorage.getItem(VEREADORES_STORAGE_KEY);
  const vereadores = vereadoresJson ? JSON.parse(vereadoresJson) : [];
  
  // Converter datas de string para Date
  return vereadores.map((vereador: any) => ({
    ...vereador,
    dataCriacao: new Date(vereador.dataCriacao)
  }));
}

// Função para salvar todos os vereadores
function saveVereadores(vereadores: Vereador[]) {
  localStorage.setItem(VEREADORES_STORAGE_KEY, JSON.stringify(vereadores));
}

// Função para obter vereadores por câmara
export function getVereadoresByCamaraId(camaraId: string): Vereador[] {
  const vereadores = getAllVereadores();
  return vereadores.filter(vereador => vereador.camaraId === camaraId);
}

// Função para obter um vereador pelo ID
export function getVereadorById(id: string): Vereador | undefined {
  const vereadores = getAllVereadores();
  return vereadores.find(vereador => vereador.id === id);
}

// Função para adicionar um novo vereador
export function addVereador(vereador: Omit<Vereador, 'id' | 'dataCriacao'>): Promise<Vereador> {
  return new Promise((resolve) => {
    const vereadores = getAllVereadores();
    
    const novoVereador: Vereador = {
      ...vereador,
      id: generateId(),
      dataCriacao: new Date()
    };
    
    vereadores.push(novoVereador);
    saveVereadores(vereadores);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(() => resolve(novoVereador), 500);
  });
}

// Função para atualizar um vereador existente
export function updateVereador(vereador: Vereador): Promise<Vereador> {
  return new Promise((resolve, reject) => {
    const vereadores = getAllVereadores();
    const index = vereadores.findIndex(v => v.id === vereador.id);
    
    if (index === -1) {
      reject(new Error('Vereador não encontrado'));
      return;
    }
    
    vereadores[index] = vereador;
    saveVereadores(vereadores);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(() => resolve(vereador), 500);
  });
}

// Função para excluir um vereador
export function deleteVereador(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const vereadores = getAllVereadores();
    const index = vereadores.findIndex(v => v.id === id);
    
    if (index === -1) {
      reject(new Error('Vereador não encontrado'));
      return;
    }
    
    vereadores.splice(index, 1);
    saveVereadores(vereadores);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(resolve, 500);
  });
} 