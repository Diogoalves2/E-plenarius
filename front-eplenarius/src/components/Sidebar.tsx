import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type SidebarProps = {
  isOpen: boolean;
};

export function Sidebar({ isOpen }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [camarasSubmenuOpen, setCamarasSubmenuOpen] = useState(false);
  const camarasRef = useRef<HTMLLIElement>(null);

  // Verificar se estamos em uma rota relacionada a câmaras
  useEffect(() => {
    if (location.pathname.includes('/admin/camaras')) {
      setCamarasSubmenuOpen(true);
    }
  }, [location.pathname]);

  // Determinar o caminho correto para a página de configurações
  const configPath = user?.type === 'camaraAdmin' && user?.camaraId 
    ? `/camara/${user.camaraId}/configuracoes` 
    : '/admin/configuracoes';

  // Função para alternar o estado do submenu de câmaras
  const toggleCamarasSubmenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir propagação do evento
    setCamarasSubmenuOpen(!camarasSubmenuOpen);
  };

  return (
    <div className={`bg-dark-500 text-white w-64 h-full flex-shrink-0 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-64'} md:relative fixed z-20`}>
      <div className="p-4 border-b border-dark-400">
        <NavLink to="/admin/dashboard" className="flex items-center">
          <span className="text-xl font-bold font-title">E-Plenarius</span>
        </NavLink>
      </div>
      <nav className="p-4">
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/admin/dashboard"
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
          <li ref={camarasRef}>
            <div className="relative">
              <button
                onClick={toggleCamarasSubmenu}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors ${
                  location.pathname.includes('/admin/camaras')
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Câmaras
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${camarasSubmenuOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {camarasSubmenuOpen && (
                <div className="pl-4 mt-1 space-y-1">
                  <NavLink
                    to="/admin/camaras"
                    end
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                      }`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Listar Câmaras
                  </NavLink>
                  <NavLink
                    to="/admin/camaras/adicionar"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                      }`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Câmara
                  </NavLink>
                </div>
              )}
            </div>
          </li>
          <li>
            <NavLink 
              to="/admin/usuarios"
              className={({ isActive }) => 
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary-500 text-white' 
                    : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                }`
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </NavLink>
          </li>
          <li>
            <NavLink
              to={configPath}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                }`
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configurações
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
} 