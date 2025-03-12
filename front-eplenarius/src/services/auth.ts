// Tipos para usuários e autenticação
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'camaraAdmin';
  camaraId?: string; // ID da câmara para administradores de câmaras
}

interface UserCredentials {
  email: string;
  password: string;
}

// Lista de usuários temporários
const users: (User & { password: string })[] = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@eplenarius.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: 2,
    name: 'Usuário Teste',
    email: 'usuario@eplenarius.com',
    password: 'usuario123',
    role: 'user'
  },
  {
    id: 3,
    name: 'Presidente da Câmara',
    email: 'presidente@camara.com',
    password: 'camara123',
    role: 'camaraAdmin',
    camaraId: '1' // ID da câmara que este usuário administra
  }
];

// Chave para armazenar o usuário no localStorage
const AUTH_STORAGE_KEY = '@EPlenarius:user';

// Função para fazer login
export const login = (credentials: UserCredentials): User | null => {
  const user = users.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );

  if (user) {
    // Remover a senha antes de armazenar/retornar o usuário
    const { password, ...userWithoutPassword } = user;
    
    // Armazenar o usuário no localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  }

  return null;
};

// Função para verificar se o usuário está logado
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
};

// Função para obter o usuário atual
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
  
  if (userStr) {
    return JSON.parse(userStr);
  }
  
  return null;
};

// Função para fazer logout
export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}; 