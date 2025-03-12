/**
 * Utilitários compartilhados entre os serviços
 */

/**
 * Gera um ID único baseado em timestamp e números aleatórios
 * @returns string ID único
 */
export function generateId(): string {
  // Combina timestamp com números aleatórios para criar um ID único
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
}

/**
 * Converte um arquivo para base64
 * @param file Arquivo a ser convertido
 * @returns Promise com a string em base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatarData(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

/**
 * Formata uma data para o formato esperado pelo input date (yyyy-mm-dd)
 * @param date Data a ser formatada
 * @returns String formatada
 */
export function formatarDataParaInput(date: Date): string {
  return new Date(date).toISOString().split('T')[0];
}

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

// Função para verificar o uso de armazenamento do localStorage
export const getLocalStorageUsage = (): { used: number, total: number, percentage: number } => {
  let total = 0;
  let used = 0;
  
  try {
    // Estimar o tamanho total disponível (5MB é comum em muitos navegadores)
    total = 5 * 1024 * 1024;
    
    // Calcular o uso atual
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    // Converter para bytes (2 bytes por caractere em UTF-16)
    used = used * 2;
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    console.error('Erro ao calcular uso do localStorage:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
};

// Função para limpar o localStorage quando estiver quase cheio
export const cleanupLocalStorageIfNeeded = (threshold = 80): boolean => {
  const usage = getLocalStorageUsage();
  
  // Se o uso estiver acima do limite (80% por padrão), limpar dados antigos
  if (usage.percentage > threshold) {
    try {
      // Estratégia: remover itens menos importantes ou mais antigos
      // Exemplo: remover dados de cache ou logs
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('log'))) {
          keysToRemove.push(key);
        }
      }
      
      // Remover os itens identificados
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
      return false;
    }
  }
  
  return false;
};

// Função para salvar dados no localStorage com tratamento de erro de quota
export const safeLocalStorageSave = (key: string, data: any): boolean => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    // Se ocorrer erro de quota, tentar limpar e salvar novamente
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      const cleaned = cleanupLocalStorageIfNeeded(70);
      
      if (cleaned) {
        try {
          // Tentar salvar novamente após limpeza
          const jsonData = JSON.stringify(data);
          localStorage.setItem(key, jsonData);
          return true;
        } catch (retryError) {
          console.error('Falha ao salvar após limpeza:', retryError);
          return false;
        }
      }
    }
    
    console.error('Erro ao salvar no localStorage:', error);
    return false;
  }
}; 