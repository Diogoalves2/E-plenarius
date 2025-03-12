// Definindo a interface para a câmara
export interface Camara {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  regimentoInterno?: string;
  imagem?: string;
  dataCriacao: Date;
  vereadores: Vereador[];
  dataAtualizacao?: string;
}

// Interface para o vereador
export interface Vereador {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  foto?: string;
  isPresidente: boolean;
}

// Chave para armazenar as câmaras no localStorage
const CAMARAS_STORAGE_KEY = '@EPlenarius:camaras';

// Câmara de exemplo para garantir que haja dados
const camaraExemplo: Camara = {
  id: '1',
  nome: 'Câmara Municipal de Exemplo',
  cnpj: '12.345.678/0001-90',
  endereco: 'Rua das Flores, 123',
  cidade: 'Cidade Exemplo',
  estado: 'EX',
  cep: '12345-678',
  telefone: '(11) 1234-5678',
  email: 'contato@camaraexemplo.gov.br',
  dataCriacao: new Date('2023-01-01'),
  vereadores: [
    {
      id: '1',
      nome: 'João da Silva',
      cargo: 'Vereador',
      email: 'joao@camaraexemplo.gov.br',
      isPresidente: true
    },
    {
      id: '2',
      nome: 'Maria Oliveira',
      cargo: 'Vereadora',
      email: 'maria@camaraexemplo.gov.br',
      isPresidente: false
    }
  ]
};

// Função para inicializar o localStorage com a câmara de exemplo
const inicializarDados = () => {
  if (!localStorage.getItem(CAMARAS_STORAGE_KEY)) {
    localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify([camaraExemplo]));
  }
};

// Inicializar dados
inicializarDados();

// Função para obter todas as câmaras
export const getCamaras = (): Camara[] => {
  const camarasStr = localStorage.getItem(CAMARAS_STORAGE_KEY);
  
  if (camarasStr) {
    const camaras = JSON.parse(camarasStr);
    // Convertendo as strings de data para objetos Date
    return camaras.map((camara: any) => ({
      ...camara,
      dataCriacao: new Date(camara.dataCriacao)
    }));
  }
  
  return [];
};

// Função para adicionar uma nova câmara
export const addCamara = async (camara: Omit<Camara, 'id' | 'dataCriacao'>): Promise<Camara> => {
  const camaras = getCamaras();
  
  const novaCamara: Camara = {
    ...camara,
    id: Date.now().toString(),
    dataCriacao: new Date()
  };
  
  const novasCamaras = [...camaras, novaCamara];
  
  // Simulando uma operação assíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify(novasCamaras));
  
  return novaCamara;
};

// Função para obter uma câmara pelo ID
export const getCamaraById = (id: string): Camara | undefined => {
  const camaras = getCamaras();
  return camaras.find(camara => camara.id === id);
};

// Função para otimizar imagens base64
export const optimizeBase64Image = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Se não for uma string base64 de imagem, retorna a string original
    if (!base64 || !base64.startsWith('data:image')) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Redimensionar se a largura for maior que maxWidth
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width));
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível obter o contexto 2D do canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter para JPEG com qualidade reduzida
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedBase64);
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    img.src = base64;
  });
};

// Função para limpar o localStorage
export const clearOldData = () => {
  try {
    // Remover dados antigos que podem não ser mais necessários
    // Por exemplo, remover câmaras que não foram acessadas recentemente
    const camaras = getCamaras();
    
    // Se houver muitas câmaras, manter apenas as 10 mais recentes
    if (camaras.length > 10) {
      // Ordenar por data de criação (mais recentes primeiro)
      const sortedCamaras = camaras.sort((a, b) => 
        new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
      );
      
      // Manter apenas as 10 mais recentes
      const camarasToKeep = sortedCamaras.slice(0, 10);
      localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify(camarasToKeep));
    }
  } catch (error) {
    console.error('Erro ao limpar dados antigos:', error);
  }
};

// Função para atualizar uma câmara
export const updateCamara = async (id: string, camaraData: Partial<Camara>): Promise<boolean> => {
  try {
    const camaras = getCamaras();
    const index = camaras.findIndex(c => c.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Otimizar imagens antes de salvar
    if (camaraData.imagem && camaraData.imagem.startsWith('data:image')) {
      camaraData.imagem = await optimizeBase64Image(camaraData.imagem);
    }
    
    // Otimizar fotos dos vereadores
    if (camaraData.vereadores) {
      for (let i = 0; i < camaraData.vereadores.length; i++) {
        const vereador = camaraData.vereadores[i];
        if (vereador.foto && vereador.foto.startsWith('data:image')) {
          camaraData.vereadores[i].foto = await optimizeBase64Image(vereador.foto, 400, 0.6);
        }
      }
    }
    
    // Atualizar a câmara
    const updatedCamara = {
      ...camaras[index],
      ...camaraData,
      dataAtualizacao: new Date().toISOString()
    };
    
    // Tentar salvar no localStorage
    try {
      camaras[index] = updatedCamara;
      localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify(camaras));
    } catch (storageError) {
      // Se ocorrer erro de quota, tentar limpar dados antigos e tentar novamente
      console.warn('Erro de armazenamento, tentando limpar dados antigos...');
      clearOldData();
      
      // Tentar salvar novamente
      localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify(camaras));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar câmara:', error);
    throw error;
  }
};

// Função para excluir uma câmara
export const deleteCamara = async (id: string): Promise<boolean> => {
  const camaras = getCamaras();
  const novasCamaras = camaras.filter(camara => camara.id !== id);
  
  if (novasCamaras.length === camaras.length) {
    return false;
  }
  
  // Simulando uma operação assíncrona
  await new Promise(resolve => setTimeout(resolve, 500));
  
  localStorage.setItem(CAMARAS_STORAGE_KEY, JSON.stringify(novasCamaras));
  
  return true;
}; 