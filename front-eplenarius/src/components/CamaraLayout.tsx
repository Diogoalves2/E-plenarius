import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, Link, NavLink } from 'react-router-dom';
import { getCamaraById } from '../services/camaras';
import { useAuth } from '../contexts/AuthContext';

export function CamaraLayout() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (camaraId) {
      carregarCamara();
    }
  }, [camaraId]);

  const carregarCamara = () => {
    try {
      setLoading(true);
      
      const camara = getCamaraById(camaraId!);
      if (camara) {
        setNomeCamara(camara.nome);
        setError(null);
      } else {
        // Se a câmara não for encontrada, apenas definimos um erro
        setError('Câmara não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar câmara:', error);
      setError('Erro ao carregar dados da câmara');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-error-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-dark-500 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">Não foi possível carregar os dados da câmara solicitada.</p>
          <button
            onClick={() => navigate('/admin/camaras')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para lista de câmaras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-dark-500 text-white w-64 flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'} fixed md:relative h-full z-20`}>
        <div className="p-4 border-b border-dark-400">
          <Link to={`/camara/${camaraId}`} className="flex items-center">
            <span className="text-xl font-bold font-title">E-Plenarius</span>
          </Link>
        </div>
        <div className="p-4 border-b border-dark-400">
          <h2 className="text-sm font-medium text-gray-400 uppercase">Câmara</h2>
          <p className="text-white font-medium truncate">{nomeCamara}</p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink
                to={`/camara/${camaraId}/dashboard`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/camara/${camaraId}/sessoes`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sessões
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/camara/${camaraId}/projetos`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Projetos
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/camara/${camaraId}/vereadores`}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Vereadores
              </NavLink>
            </li>
            <li>
              <NavLink 
                to={`/camara/${camaraId}/configuracoes`}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Configurações
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="mt-8 pt-4 border-t border-dark-400">
          <ul className="space-y-1">
            {user?.type === 'admin' && (
              <li>
                <Link 
                  to="/admin/camaras"
                  className="flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-dark-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Voltar para Admin
                </Link>
              </li>
            )}
            <li>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 rounded-md text-gray-300 hover:bg-dark-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Olá, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-primary-500 hover:text-primary-700 focus:outline-none"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 