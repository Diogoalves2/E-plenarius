import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Camaras } from './pages/Camaras';
import { AdicionarCamara } from './pages/Camaras/AdicionarCamara';
import { DetalhesCamara } from './pages/Camaras/DetalhesCamara';
import { EditarCamara } from './pages/Camaras/EditarCamara';
import { CamaraDashboard } from './pages/Camara/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { CamaraLayout } from './components/CamaraLayout';
import './styles/index.css';
import { ListarSessoes } from './pages/Camara/Sessoes';
import { AdicionarSessao } from './pages/Camara/Sessoes/AdicionarSessao';
import { DetalhesSessao } from './pages/Camara/Sessoes/DetalhesSessao';
import { PresencaVereadores } from './pages/Camara/Sessoes/PresencaVereadores';
import { PresencaVereadoresTV } from './pages/Camara/Sessoes/PresencaVereadoresTV';
import { ListarProjetos } from './pages/Camara/Projetos';
import { AdicionarProjeto } from './pages/Camara/Projetos/AdicionarProjeto';
import { DetalhesProjeto } from './pages/Camara/Projetos/DetalhesProjeto';
import { EditarProjeto } from './pages/Camara/Projetos/EditarProjeto';
import { ListarVereadores } from './pages/Camara/Vereadores';
import { AdicionarVereador } from './pages/Camara/Vereadores/AdicionarVereador';
import { DetalhesVereador } from './pages/Camara/Vereadores/DetalhesVereador';
import { EditarVereador } from './pages/Camara/Vereadores/EditarVereador';
import { VotacaoVereadores } from './pages/Camara/Sessoes/VotacaoVereadores';
import { VotacaoVereadoresTV } from './pages/Camara/Sessoes/VotacaoVereadoresTV';
import { Configuracoes } from './pages/Configuracoes';
import { Usuarios } from './pages/Usuarios';
import { carregarEAplicarConfiguracoes } from './services/configuracoes';
import { useEffect } from 'react';
import { PainelTempo } from './pages/Camara/Sessoes/PainelTempo';
import { PainelTempoTV } from './pages/Camara/Sessoes/PainelTempoTV';

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  // Se ainda estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente para redirecionar usuários já autenticados
const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  
  // Se ainda estiver carregando, mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  // Se estiver autenticado, redireciona para a página apropriada
  if (user) {
    if (user.type === 'admin') {
      return <Navigate to="/admin/camaras" replace />;
    } else if (user.type === 'camaraAdmin' && user.camaraId) {
      return <Navigate to={`/camara/${user.camaraId}`} replace />;
    }
  }
  
  return children;
};

function App() {
  // Carregar e aplicar configurações ao iniciar a aplicação
  useEffect(() => {
    carregarEAplicarConfiguracoes();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          } />
          
          {/* Rota pública para exibição em TV */}
          <Route path="/tv/camara/:camaraId/sessoes/:sessaoId/presenca" element={<PresencaVereadoresTV />} />
          <Route path="/tv/camara/:camaraId/sessoes/:sessaoId/projetos/:projetoId/votacao" element={<VotacaoVereadoresTV />} />
          <Route path="/tv/camara/:camaraId/sessoes/:sessaoId/tempo" element={<PainelTempoTV />} />
          
          {/* Rotas do painel administrativo geral */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="camaras" element={<Camaras />} />
            <Route path="camaras/adicionar" element={<AdicionarCamara />} />
            <Route path="camaras/editar/:id" element={<EditarCamara />} />
            <Route path="camaras/:id" element={<DetalhesCamara />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            {/* Adicione outras rotas do painel administrativo geral aqui */}
          </Route>
          
          {/* Rotas do painel administrativo da câmara */}
          <Route path="/camara/:camaraId" element={
            <ProtectedRoute>
              <CamaraLayout />
            </ProtectedRoute>
          }>
            <Route index element={<CamaraDashboard />} />
            <Route path="dashboard" element={<CamaraDashboard />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            
            {/* Rotas de Sessões */}
            <Route path="sessoes" element={<ListarSessoes />} />
            <Route path="sessoes/adicionar" element={<AdicionarSessao />} />
            <Route path="sessoes/:sessaoId" element={<DetalhesSessao />} />
            <Route path="sessoes/:sessaoId/presenca" element={<PresencaVereadores />} />
            <Route path="sessoes/:sessaoId/projetos/:projetoId/votacao" element={<VotacaoVereadores />} />
            <Route path="sessoes/:sessaoId/tempo" element={<PainelTempo />} />
            
            {/* Rotas de Projetos */}
            <Route path="projetos" element={<ListarProjetos />} />
            <Route path="projetos/adicionar" element={<AdicionarProjeto />} />
            <Route path="projetos/:projetoId" element={<DetalhesProjeto />} />
            <Route path="projetos/editar/:projetoId" element={<EditarProjeto />} />
            
            {/* Rotas de Vereadores */}
            <Route path="vereadores" element={<ListarVereadores />} />
            <Route path="vereadores/adicionar" element={<AdicionarVereador />} />
            <Route path="vereadores/:vereadorId" element={<DetalhesVereador />} />
            <Route path="vereadores/:vereadorId/editar" element={<EditarVereador />} />
            
            {/* Adicione outras rotas do painel administrativo da câmara aqui */}
          </Route>
          
          {/* Rota padrão - redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
