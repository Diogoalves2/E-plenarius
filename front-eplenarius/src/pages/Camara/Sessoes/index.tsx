import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSessoesByCamaraId, Sessao, deleteSessao } from '../../../services/sessoes';
import { getCamaraById } from '../../../services/camaras';

type StatusFilter = 'todas' | 'agendada' | 'realizada' | 'cancelada';
type TipoFilter = 'todas' | 'ordinaria' | 'extraordinaria' | 'solene';

export function ListarSessoes() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todas');
  const [sessaoParaExcluir, setSessaoParaExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [nomeCamara, setNomeCamara] = useState('');
  const [camaraNotFound, setCamaraNotFound] = useState(false);

  useEffect(() => {
    if (camaraId) {
      carregarSessoes();
      carregarNomeCamara();
    }
  }, [camaraId]);

  const carregarSessoes = () => {
    try {
      setLoading(true);
      if (!camaraId) return;
      
      const sessoesData = getSessoesByCamaraId(camaraId);
      setSessoes(sessoesData);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      setErro('Não foi possível carregar as sessões. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const carregarNomeCamara = () => {
    if (!camaraId) return;
    
    const camara = getCamaraById(camaraId);
    if (camara) {
      setNomeCamara(camara.nome);
      setCamaraNotFound(false);
    } else {
      setErro('Câmara não encontrada');
      setCamaraNotFound(true);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);
      await deleteSessao(id);
      setSessoes(sessoes.filter(sessao => sessao.id !== id));
      setSessaoParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      setErro('Não foi possível excluir a sessão. Tente novamente mais tarde.');
    } finally {
      setExcluindo(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora: string) => {
    return hora;
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

  const filtrarSessoes = () => {
    return sessoes.filter(sessao => {
      const passaFiltroStatus = statusFilter === 'todas' || sessao.status === statusFilter;
      const passaFiltroTipo = tipoFilter === 'todas' || sessao.tipo === tipoFilter;
      return passaFiltroStatus && passaFiltroTipo;
    });
  };

  const sessoesFiltered = filtrarSessoes();

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Sessões - {nomeCamara}</h1>
        <Link 
          to={`/camara/${camaraId}/sessoes/adicionar`} 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agendar Sessão
        </Link>
      </div>

      {erro && !camaraNotFound && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="agendada">Agendadas</option>
              <option value="realizada">Realizadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="tipoFilter" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Tipo
            </label>
            <select
              id="tipoFilter"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="todas">Todos</option>
              <option value="ordinaria">Ordinárias</option>
              <option value="extraordinaria">Extraordinárias</option>
              <option value="solene">Solenes</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : sessoesFiltered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Nenhuma sessão encontrada</h2>
          <p className="text-gray-600 mb-6">Não há sessões com os filtros selecionados.</p>
          <Link 
            to={`/camara/${camaraId}/sessoes/adicionar`} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agendar Sessão
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                {sessoesFiltered.map((sessao) => (
                  <tr key={sessao.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-500">{sessao.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatarData(sessao.data)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatarHora(sessao.horaInicio)} - {formatarHora(sessao.horaFim)}</div>
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
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/camara/${camaraId}/sessoes/${sessao.id}`}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          Ver detalhes
                        </Link>
                        <button
                          onClick={() => setSessaoParaExcluir(sessao.id)}
                          className="text-error-500 hover:text-error-700"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {sessaoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessaoParaExcluir(null)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => sessaoParaExcluir && handleExcluir(sessaoParaExcluir)}
                className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 