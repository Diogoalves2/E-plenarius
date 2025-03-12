import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCamaraById } from '../../../services/camaras';
import { getProximasSessoes, getSessoesPassadas, Sessao } from '../../../services/sessoes';

export function CamaraDashboard() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [nomeCamara, setNomeCamara] = useState('');
  const [proximasSessoes, setProximasSessoes] = useState<Sessao[]>([]);
  const [sessoesPassadas, setSessoesPassadas] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);

  useEffect(() => {
    if (camaraId) {
      carregarDados();
    }
  }, [camaraId]);

  const carregarDados = () => {
    try {
      setLoading(true);
      
      // Carregar nome da câmara
      const camara = getCamaraById(camaraId!);
      if (camara) {
        setNomeCamara(camara.nome);
        setCamaraNotFound(false);
        
        // Carregar próximas sessões
        const proximas = getProximasSessoes(camaraId!);
        setProximasSessoes(proximas);
        
        // Carregar sessões passadas
        const passadas = getSessoesPassadas(camaraId!);
        setSessoesPassadas(passadas);
        
        setErro(null);
      } else {
        setErro('Câmara não encontrada');
        setCamaraNotFound(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTipoSessao = (tipo: string) => {
    switch (tipo) {
      case 'ordinaria':
        return 'Ordinária';
      case 'extraordinaria':
        return 'Extraordinária';
      case 'solene':
        return 'Solene';
      default:
        return tipo;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-primary-100 text-primary-800';
      case 'realizada':
        return 'bg-success-100 text-success-800';
      case 'cancelada':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusSessao = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'realizada':
        return 'Realizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (camaraNotFound) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Câmara não encontrada</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar a câmara solicitada.</p>
          <Link 
            to="/admin/camaras" 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para lista de câmaras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Dashboard - {nomeCamara}</h1>
      </div>

      {erro && !camaraNotFound && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card de estatísticas - Sessões */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Sessões</p>
              <p className="text-2xl font-semibold text-dark-500">{proximasSessoes.length + sessoesPassadas.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to={`/camara/${camaraId}/sessoes`}
              className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            >
              Ver todas as sessões →
            </Link>
          </div>
        </div>

        {/* Card de estatísticas - Próximas Sessões */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-success-100 text-success-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Próximas Sessões</p>
              <p className="text-2xl font-semibold text-dark-500">{proximasSessoes.length}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to={`/camara/${camaraId}/sessoes/adicionar`}
              className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            >
              Agendar nova sessão →
            </Link>
          </div>
        </div>

        {/* Card de estatísticas - Sessões Realizadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-800 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Sessões Realizadas</p>
              <p className="text-2xl font-semibold text-dark-500">{sessoesPassadas.filter(s => s.status === 'realizada').length}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to={`/camara/${camaraId}/sessoes`}
              className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            >
              Ver histórico →
            </Link>
          </div>
        </div>
      </div>

      {/* Próximas Sessões */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dark-500 font-title">Próximas Sessões</h2>
          <Link 
            to={`/camara/${camaraId}/sessoes/adicionar`}
            className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
          >
            Agendar Sessão
          </Link>
        </div>

        {proximasSessoes.length === 0 ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-2">Nenhuma sessão agendada</p>
            <Link 
              to={`/camara/${camaraId}/sessoes/adicionar`}
              className="text-primary-500 hover:text-primary-700 text-sm font-medium"
            >
              Agendar uma sessão agora
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proximasSessoes.slice(0, 5).map((sessao) => (
                  <tr key={sessao.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-500">{sessao.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatarData(sessao.data)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sessao.horaInicio} - {sessao.horaFim}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTipoSessao(sessao.tipo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sessao.status)}`}>
                        {getStatusSessao(sessao.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/camara/${camaraId}/sessoes/${sessao.id}`}
                        className="text-primary-500 hover:text-primary-700"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {proximasSessoes.length > 5 && (
              <div className="mt-4 text-center">
                <Link 
                  to={`/camara/${camaraId}/sessoes`}
                  className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todas as sessões →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Últimas Sessões Realizadas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Últimas Sessões Realizadas</h2>

        {sessoesPassadas.filter(s => s.status === 'realizada').length === 0 ? (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">Nenhuma sessão realizada até o momento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessoesPassadas
                  .filter(s => s.status === 'realizada')
                  .slice(0, 5)
                  .map((sessao) => (
                    <tr key={sessao.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-dark-500">{sessao.titulo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatarData(sessao.data)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTipoSessao(sessao.tipo)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`/camara/${camaraId}/sessoes/${sessao.id}`}
                          className="text-primary-500 hover:text-primary-700"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            
            {sessoesPassadas.filter(s => s.status === 'realizada').length > 5 && (
              <div className="mt-4 text-center">
                <Link 
                  to={`/camara/${camaraId}/sessoes`}
                  className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                >
                  Ver histórico completo →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 