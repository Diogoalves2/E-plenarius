// Definindo a interface para o usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'camaraAdmin';
  camaraId?: string;
  ativo: boolean;
  senha?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

// Chave para armazenar os usuários no localStorage
const USUARIOS_STORAGE_KEY = '@EPlenarius:usuarios';

// Usuários de exemplo para garantir que haja dados
const usuariosExemplo: Usuario[] = [
  {
    id: '1',
    nome: 'Admin Principal',
    email: 'admin@eplenarius.com',
    tipo: 'admin',
    ativo: true,
    senha: '123456', // Em produção, nunca armazenar senhas em texto puro
    dataCriacao: new Date().toISOString()
  },
  {
    id: '2',
    nome: 'Gerente Câmara',
    email: 'gerente@camara.gov.br',
    tipo: 'camaraAdmin',
    camaraId: '1',
    ativo: true,
    senha: '123456', // Em produção, nunca armazenar senhas em texto puro
    dataCriacao: new Date().toISOString()
  }
];

// Função para inicializar o localStorage com os usuários de exemplo
const inicializarDados = () => {
  if (!localStorage.getItem(USUARIOS_STORAGE_KEY)) {
    localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuariosExemplo));
  }
};

// Inicializar dados
inicializarDados();

// Função para obter todos os usuários
export const getUsuarios = (): Usuario[] => {
  const usuariosStr = localStorage.getItem(USUARIOS_STORAGE_KEY);
  
  if (usuariosStr) {
    return JSON.parse(usuariosStr);
  }
  
  return [];
};

// Função para obter um usuário pelo ID
export const getUsuarioById = (id: string): Usuario | undefined => {
  const usuarios = getUsuarios();
  return usuarios.find(usuario => usuario.id === id);
};

// Função para adicionar um novo usuário
export const addUsuario = (usuario: Omit<Usuario, 'id' | 'dataCriacao'>): Usuario => {
  const usuarios = getUsuarios();
  
  const novoUsuario: Usuario = {
    ...usuario,
    id: Date.now().toString(),
    dataCriacao: new Date().toISOString()
  };
  
  const novosUsuarios = [...usuarios, novoUsuario];
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(novosUsuarios));
  
  return novoUsuario;
};

// Função para atualizar um usuário
export const updateUsuario = (id: string, usuarioData: Partial<Usuario>): Usuario | null => {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex(u => u.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Atualizar o usuário
  const updatedUsuario: Usuario = {
    ...usuarios[index],
    ...usuarioData,
    dataAtualizacao: new Date().toISOString()
  };
  
  usuarios[index] = updatedUsuario;
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(usuarios));
  
  return updatedUsuario;
};

// Função para excluir um usuário
export const deleteUsuario = (id: string): boolean => {
  const usuarios = getUsuarios();
  const novosUsuarios = usuarios.filter(usuario => usuario.id !== id);
  
  if (novosUsuarios.length === usuarios.length) {
    return false;
  }
  
  localStorage.setItem(USUARIOS_STORAGE_KEY, JSON.stringify(novosUsuarios));
  
  return true;
}; 