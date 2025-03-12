import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface CamaraSidebarProps {
  isOpen: boolean;
  camaraId: string;
}

export function CamaraSidebar({ isOpen, camaraId }: CamaraSidebarProps) {
  const [sessoesOpen, setSessoesOpen] = useState(false);
  const [vereadoresOpen, setVereadoresOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);
  
  const sessoesButtonRef = useRef<HTMLButtonElement>(null);
  const vereadoresButtonRef = useRef<HTMLButtonElement>(null);
  const projetosButtonRef = useRef<HTMLButtonElement>(null);
  
  const [sessoesSubmenuPosition, setSessoesSubmenuPosition] = useState(0);
  const [vereadoresSubmenuPosition, setVereadoresSubmenuPosition] = useState(0);
  const [projetosSubmenuPosition, setProjetosSubmenuPosition] = useState(0);

  const toggleSessoes = () => {
    setSessoesOpen(!sessoesOpen);
    setVereadoresOpen(false);
    setProjetosOpen(false);
  };

  const toggleVereadores = () => {
    setVereadoresOpen(!vereadoresOpen);
    setSessoesOpen(false);
    setProjetosOpen(false);
  };

  const toggleProjetos = () => {
    setProjetosOpen(!projetosOpen);
    setSessoesOpen(false);
    setVereadoresOpen(false);
  };

  // Atualiza a posição dos submenus quando os botões são clicados
  useEffect(() => {
    if (sessoesButtonRef.current && !isOpen) {
      const rect = sessoesButtonRef.current.getBoundingClientRect();
      setSessoesSubmenuPosition(rect.top);
    }
  }, [sessoesOpen, isOpen]);

  useEffect(() => {
    if (vereadoresButtonRef.current && !isOpen) {
      const rect = vereadoresButtonRef.current.getBoundingClientRect();
      setVereadoresSubmenuPosition(rect.top);
    }
  }, [vereadoresOpen, isOpen]);

  useEffect(() => {
    if (projetosButtonRef.current && !isOpen) {
      const rect = projetosButtonRef.current.getBoundingClientRect();
      setProjetosSubmenuPosition(rect.top);
    }
  }, [projetosOpen, isOpen]);

  const location = useLocation();

  return (
    <aside className={`bg-primary-700 text-white h-full fixed left-0 top-0 pt-16 transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} shadow-lg z-10`}>
      <div className="overflow-y-auto h-full">
        <nav className="mt-4">
          <ul className={`${isOpen ? 'px-6' : 'px-2'}`}>
            {/* Dashboard */}
            <li className="mb-2">
              <NavLink 
                to={`/camara/${camaraId}/dashboard`} 
                className={({ isActive }) => 
                  `flex items-center w-full p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isOpen && <span>Dashboard</span>}
              </NavLink>
            </li>
            
            {/* Sessões */}
            <li className="mb-2 relative">
              <button 
                ref={sessoesButtonRef}
                onClick={toggleSessoes}
                className={`flex items-center w-full p-2 rounded-md transition-colors text-left ${sessoesOpen ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isOpen && <span>Sessões</span>}
                {isOpen && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-auto transition-transform ${sessoesOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Submenu - visível apenas quando a sidebar está aberta */}
              {isOpen && (
                <div className={`mt-1 ml-6 pl-2 border-l border-primary-500 ${sessoesOpen ? 'block' : 'hidden'}`}>
                  <NavLink 
                    to={`/camara/${camaraId}/sessoes`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <span>Listar Sessões</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/sessoes/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <span>Agendar Sessão</span>
                  </NavLink>
                </div>
              )}
              
              {/* Submenu para sidebar reduzida */}
              {!isOpen && sessoesOpen && (
                <div 
                  className="fixed left-16 bg-primary-700 rounded-md shadow-lg p-2 w-48 z-20"
                  style={{ top: `${sessoesSubmenuPosition}px` }}
                >
                  <NavLink 
                    to={`/camara/${camaraId}/sessoes`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Listar Sessões</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/sessoes/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agendar Sessão</span>
                  </NavLink>
                </div>
              )}
            </li>
            
            {/* Vereadores */}
            <li className="mb-2 relative">
              <button 
                ref={vereadoresButtonRef}
                onClick={toggleVereadores}
                className={`flex items-center w-full p-2 rounded-md transition-colors text-left ${vereadoresOpen ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {isOpen && <span>Vereadores</span>}
                {isOpen && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-auto transition-transform ${vereadoresOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Submenu - visível apenas quando a sidebar está aberta */}
              {isOpen && (
                <div className={`mt-1 ml-6 pl-2 border-l border-primary-500 ${vereadoresOpen ? 'block' : 'hidden'}`}>
                  <NavLink 
                    to={`/camara/${camaraId}/vereadores`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <span>Listar Vereadores</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/vereadores/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <span>Adicionar Vereador</span>
                  </NavLink>
                </div>
              )}
              
              {/* Submenu para sidebar reduzida */}
              {!isOpen && vereadoresOpen && (
                <div 
                  className="fixed left-16 bg-primary-700 rounded-md shadow-lg p-2 w-48 z-20"
                  style={{ top: `${vereadoresSubmenuPosition}px` }}
                >
                  <NavLink 
                    to={`/camara/${camaraId}/vereadores`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Listar Vereadores</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/vereadores/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar Vereador</span>
                  </NavLink>
                </div>
              )}
            </li>
            
            {/* Projetos de Lei */}
            <li className="mb-2 relative">
              <button 
                ref={projetosButtonRef}
                onClick={toggleProjetos}
                className={`flex items-center w-full p-2 rounded-md transition-colors text-left ${projetosOpen ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isOpen && <span>Projetos de Lei</span>}
                {isOpen && (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-auto transition-transform ${projetosOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
              
              {/* Submenu - visível apenas quando a sidebar está aberta */}
              {isOpen && (
                <div className={`mt-1 ml-6 pl-2 border-l border-primary-500 ${projetosOpen ? 'block' : 'hidden'}`}>
                  <NavLink 
                    to={`/camara/${camaraId}/projetos`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <span>Listar Projetos</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/projetos/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <span>Adicionar Projeto</span>
                  </NavLink>
                </div>
              )}
              
              {/* Submenu para sidebar reduzida */}
              {!isOpen && projetosOpen && (
                <div 
                  className="fixed left-16 bg-primary-700 rounded-md shadow-lg p-2 w-48 z-20"
                  style={{ top: `${projetosSubmenuPosition}px` }}
                >
                  <NavLink 
                    to={`/camara/${camaraId}/projetos`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                    end
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Listar Projetos</span>
                  </NavLink>
                  
                  <NavLink 
                    to={`/camara/${camaraId}/projetos/adicionar`} 
                    className={({ isActive }) => 
                      `flex items-center p-2 rounded-md transition-colors ${isActive ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-primary-600 hover:text-white'}`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar Projeto</span>
                  </NavLink>
                </div>
              )}
            </li>
            
            {/* Configurações */}
            <li className="mb-2">
              <NavLink 
                to={`/camara/${camaraId}/configuracoes`}
                className={
                  `flex items-center px-4 py-2 rounded-md transition-colors ${
                    location.pathname.includes(`/camara/${camaraId}/configuracoes`)
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isOpen && <span>Configurações</span>}
              </NavLink>
            </li>
            
            {/* Voltar para Admin */}
            <li className="mt-8">
              <NavLink 
                to="/admin/camaras" 
                className={({ isActive }) => 
                  `flex items-center w-full p-2 rounded-md transition-colors text-gray-300 hover:bg-primary-600 hover:text-white`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                {isOpen && <span>Voltar para Admin</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
} 