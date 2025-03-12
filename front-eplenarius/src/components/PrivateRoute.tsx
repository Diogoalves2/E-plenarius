import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function PrivateRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Se estiver carregando, não renderiza nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissões com base no tipo de usuário e na rota
  const path = location.pathname;
  
  // Rotas do painel administrativo geral (apenas admin)
  if (path.startsWith('/admin') && user?.role !== 'admin') {
    // Se não for admin, redirecionar para a rota apropriada
    if (user?.role === 'camaraAdmin' && user?.camaraId) {
      return <Navigate to={`/camara/${user.camaraId}/dashboard`} replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  // Rotas do painel administrativo da câmara (apenas camaraAdmin da câmara específica)
  if (path.startsWith('/camara/')) {
    const camaraIdFromPath = path.split('/')[2]; // Extrair o ID da câmara da URL
    
    if (user?.role === 'camaraAdmin') {
      // Verificar se o usuário é admin da câmara específica
      if (user.camaraId !== camaraIdFromPath) {
        return <Navigate to={`/camara/${user.camaraId}/dashboard`} replace />;
      }
    } else if (user?.role !== 'admin') {
      // Apenas admin geral ou admin da câmara específica podem acessar
      return <Navigate to="/login" replace />;
    }
  }

  // Se passou por todas as verificações, permite o acesso
  return <Outlet />;
} 