import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Home() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirecionar com base no tipo de usuário
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'camaraAdmin' && user.camaraId) {
          navigate(`/camara/${user.camaraId}/dashboard`);
        } else {
          navigate('/admin/dashboard'); // Fallback para outros tipos de usuário
        }
      } else {
        // Se não estiver autenticado, redirecionar para a página de login
        navigate('/login');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Exibir um loader enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-dark-500">Redirecionando...</h1>
      </div>
    </div>
  );
} 