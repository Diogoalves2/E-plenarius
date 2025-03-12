import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // Redirecionamento é feito pelo componente RedirectIfAuthenticated no App.tsx
    } catch (error) {
      setError('Falha no login. Verifique suas credenciais.');
      console.error('Erro de login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-dark-500 font-title">E-Plenarius</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-dark-500 font-title">Acesse sua conta</h2>
        </div>
        
        {error && (
          <div className="bg-error-100 text-error-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark-500 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-dark-500 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="text-sm text-primary-500 hover:text-primary-700 focus:outline-none w-full text-center"
          >
            {showCredentials ? 'Ocultar credenciais de exemplo' : 'Mostrar credenciais de exemplo'}
          </button>
          
          {showCredentials && (
            <div className="mt-4 bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-dark-500 mb-2">Usuários para teste:</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-dark-500">Administrador Geral:</p>
                  <p className="text-sm text-gray-600">Email: admin@example.com</p>
                  <p className="text-sm text-gray-600">Senha: admin123</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-dark-500">Administrador da Câmara:</p>
                  <p className="text-sm text-gray-600">Email: camara@example.com</p>
                  <p className="text-sm text-gray-600">Senha: camara123</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 