import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCamaraById } from '../../services/camaras';

export function CamaraDashboard() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [camara, setCamara] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessoes: 0,
    sessoesAgendadas: 0,
    totalVereadores: 0,
    totalProjetos: 0,
    projetosAprovados: 0,
    projetosEmAnalise: 0
  });

  useEffect(() => {
    const carregarCamara = () => {
      if (!camaraId) return;

      try {
        const camaraData = getCamaraById(camaraId);
        if (camaraData) {
          setCamara(camaraData);
          
          // Aqui você carregaria estatísticas reais da câmara
          // Por enquanto, vamos usar dados fictícios
          setStats({
            totalSessoes: 24,
            sessoesAgendadas: 3,
            totalVereadores: camaraData.vereadores?.length || 0,
            totalProjetos: 42,
            projetosAprovados: 28,
            projetosEmAnalise: 14
          });
        }
      } catch (error) {
        console.error('Erro ao carregar câmara:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarCamara();
  }, [camaraId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-500 mb-6 font-title">Dashboard</h1>
      
      {/* Informações da Câmara */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          {camara.imagem && (
            <div className="mb-4 md:mb-0 md:mr-6">
              <img 
                src={camara.imagem} 
                alt={camara.nome} 
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-dark-500 font-title">{camara.nome}</h2>
            <p className="text-gray-600">{camara.cidade}, {camara.estado}</p>
            <p className="text-gray-600 mt-1">CNPJ: {camara.cnpj}</p>
            {camara.email && <p className="text-gray-600">Email: {camara.email}</p>}
          </div>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sessões */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-primary-100 text-primary-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-500 font-title">Sessões</h3>
              <p className="text-gray-500 text-sm">Resumo de sessões</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold text-dark-500">{stats.totalSessoes}</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">{stats.sessoesAgendadas}</p>
              <p className="text-gray-500 text-sm">Agendadas</p>
            </div>
          </div>
        </div>
        
        {/* Vereadores */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-500 font-title">Vereadores</h3>
              <p className="text-gray-500 text-sm">Membros da câmara</p>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-dark-500">{stats.totalVereadores}</p>
            <p className="text-gray-500 text-sm">Total de vereadores</p>
          </div>
        </div>
        
        {/* Projetos de Lei */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-success-100 text-success-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-500 font-title">Projetos de Lei</h3>
              <p className="text-gray-500 text-sm">Resumo de projetos</p>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-2xl font-bold text-dark-500">{stats.totalProjetos}</p>
              <p className="text-gray-500 text-sm">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success-500">{stats.projetosAprovados}</p>
              <p className="text-gray-500 text-sm">Aprovados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning-500">{stats.projetosEmAnalise}</p>
              <p className="text-gray-500 text-sm">Em análise</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Próximas Sessões */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-dark-500 mb-4 font-title">Próximas Sessões</h2>
        
        {/* Lista de sessões (fictícia) */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projetos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  15/06/2023 - 19:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Ordinária
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                    Confirmada
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  5 projetos
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  22/06/2023 - 19:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Ordinária
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800">
                    Pendente
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  3 projetos
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  29/06/2023 - 19:00
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Extraordinária
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-100 text-warning-800">
                    Pendente
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  2 projetos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Vereadores */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-dark-500 mb-4 font-title">Vereadores</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {camara.vereadores && camara.vereadores.map((vereador: any) => (
            <div key={vereador.id} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
              {vereador.foto ? (
                <img 
                  src={vereador.foto} 
                  alt={vereador.nome} 
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-xs">Sem foto</span>
                </div>
              )}
              <h3 className="font-medium text-dark-500">{vereador.nome}</h3>
              <p className="text-sm text-gray-500">{vereador.cargo}</p>
              {vereador.isPresidente && (
                <span className="mt-1 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
                  Presidente
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 