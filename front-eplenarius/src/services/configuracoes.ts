// Interface para as configurações do sistema
export interface ConfiguracoesType {
  tema: string;
  corPrimaria: string;
  corSecundaria: string;
  mostrarLogo: boolean;
  tamanhoFonte: 'pequeno' | 'medio' | 'grande';
  modoContraste: boolean;
  tempoSessaoInativa: number; // em minutos
  notificacoesAtivas: boolean;
}

// Chave para armazenamento no localStorage
const CONFIGURACOES_STORAGE_KEY = 'e-plenarius:configuracoes';

// Temas padrão disponíveis
export const temasPadrao = [
  {
    id: 'padrao',
    nome: 'Padrão (Azul/Verde)',
    corPrimaria: '#1E40AF',
    corSecundaria: '#047857'
  },
  {
    id: 'escuro',
    nome: 'Escuro',
    corPrimaria: '#1F2937',
    corSecundaria: '#4B5563'
  },
  {
    id: 'claro',
    nome: 'Claro',
    corPrimaria: '#60A5FA',
    corSecundaria: '#34D399'
  },
  {
    id: 'vermelho',
    nome: 'Vermelho',
    corPrimaria: '#DC2626',
    corSecundaria: '#F59E0B'
  },
  {
    id: 'roxo',
    nome: 'Roxo',
    corPrimaria: '#7C3AED',
    corSecundaria: '#EC4899'
  }
];

// Configurações padrão
const configuracoesDefault: ConfiguracoesType = {
  tema: 'padrao',
  corPrimaria: '#1E40AF',
  corSecundaria: '#047857',
  mostrarLogo: true,
  tamanhoFonte: 'medio',
  modoContraste: false,
  tempoSessaoInativa: 30,
  notificacoesAtivas: true
};

// Inicializa o localStorage com configurações padrão se necessário
const initializeLocalStorage = () => {
  if (!localStorage.getItem(CONFIGURACOES_STORAGE_KEY)) {
    localStorage.setItem(CONFIGURACOES_STORAGE_KEY, JSON.stringify(configuracoesDefault));
  }
};

// Inicializa o localStorage quando o módulo é carregado
initializeLocalStorage();

// Função para obter as configurações
export function getConfiguracoes(): ConfiguracoesType {
  const configuracoesJson = localStorage.getItem(CONFIGURACOES_STORAGE_KEY);
  
  if (configuracoesJson) {
    return JSON.parse(configuracoesJson);
  }
  
  return configuracoesDefault;
}

// Função para salvar as configurações
export function saveConfiguracoes(configuracoes: ConfiguracoesType): Promise<void> {
  return new Promise((resolve) => {
    localStorage.setItem(CONFIGURACOES_STORAGE_KEY, JSON.stringify(configuracoes));
    
    // Aplicar configurações ao DOM
    aplicarConfiguracoes(configuracoes);
    
    // Simular um pequeno atraso para parecer uma operação assíncrona real
    setTimeout(resolve, 500);
  });
}

// Função para aplicar as configurações ao DOM
export function aplicarConfiguracoes(configuracoes: ConfiguracoesType): void {
  const root = document.documentElement;
  
  // Aplicar cores
  root.style.setProperty('--color-primary', configuracoes.corPrimaria);
  root.style.setProperty('--color-secondary', configuracoes.corSecundaria);
  
  // Aplicar tamanho da fonte
  const fontSizeMap = {
    pequeno: '14px',
    medio: '16px',
    grande: '18px'
  };
  root.style.setProperty('--font-size-base', fontSizeMap[configuracoes.tamanhoFonte]);
  
  // Aplicar modo de contraste
  if (configuracoes.modoContraste) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
  
  // Aplicar visibilidade do logo
  const logoElement = document.querySelector('.app-logo');
  if (logoElement) {
    if (configuracoes.mostrarLogo) {
      logoElement.classList.remove('hidden');
    } else {
      logoElement.classList.add('hidden');
    }
  }
}

// Função para carregar e aplicar as configurações ao iniciar a aplicação
export function carregarEAplicarConfiguracoes(): void {
  const configuracoes = getConfiguracoes();
  aplicarConfiguracoes(configuracoes);
} 