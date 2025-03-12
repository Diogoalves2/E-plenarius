import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserType = 'admin' | 'camaraAdmin';

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  camaraId?: string; // ID da câmara para usuários do tipo camaraAdmin
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulação de autenticação
      // Em um ambiente real, isso seria uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Usuários de exemplo
      const adminUser: User = {
        id: '1',
        name: 'Administrador',
        email: 'admin@example.com',
        type: 'admin'
      };
      
      const camaraAdminUser: User = {
        id: '2',
        name: 'Admin da Câmara',
        email: 'camara@example.com',
        type: 'camaraAdmin',
        camaraId: '1' // ID da câmara que este usuário administra
      };
      
      // Verificar credenciais
      let authenticatedUser: User | null = null;
      
      if (email === 'admin@example.com' && password === 'admin123') {
        authenticatedUser = adminUser;
      } else if (email === 'camara@example.com' && password === 'camara123') {
        authenticatedUser = camaraAdminUser;
      }
      
      if (!authenticatedUser) {
        throw new Error('Credenciais inválidas');
      }
      
      // Salvar usuário no estado e localStorage
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 