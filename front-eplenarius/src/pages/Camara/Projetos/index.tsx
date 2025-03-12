import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProjetosByCamaraId, Projeto, deleteProjeto } from '../../../services/projetos';
import { getCamaraById } from '../../../services/camaras';

type SituacaoFilter = 'todas' | 'tramitacao' | 'aprovado' | 'rejeitado' | 'arquivado';
type TipoFilter = 'todas' | 'lei' | 'resolucao' | 'decreto' | 'emenda' | 'outro';

export function ListarProjetos() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [situacaoFilter, setSituacaoFilter] = useState<SituacaoFilter>('todas');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todas');
  const [projetoParaExcluir, setProjetoParaExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [nomeCamara, setNomeCamara] = useState('');
  const [camaraNotFound, setCamaraNotFound] = useState(false);

  useEffect(() => {
    if (camaraId) {
      carregarProjetos();
      carregarNomeCamara();
    }
  }, [camaraId]);

  const carregarProjetos = () => {
    try {
      setLoading(true);
      if (!camaraId) return;
      
      const projetosData = getProjetosByCamaraId(camaraId);
      setProjetos(projetosData);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      setErro('Não foi possível carregar os projetos. Tente novamente mais tarde.');
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
      const sucesso = deleteProjeto(id);
      
      if (sucesso) {
        setProjetos(projetos.filter(projeto => projeto.id !== id));
        setProjetoParaExcluir(null);
      } else {
        setErro('Não foi possível excluir o projeto.');
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      setErro('Não foi possível excluir o projeto. Tente novamente mais tarde.');
    } finally {
      setExcluindo(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTipoProjeto = (tipo: string) => {
    switch (tipo) {
      case 'lei':
        return 'Projeto de Lei';
      case 'resolucao':
        return 'Projeto de Resolução';
      case 'decreto':
        return 'Projeto de Decreto';
      case 'emenda':
        return 'Emenda';
      case 'outro':
        return 'Outro';
      default:
        return tipo;
    }
  };

  const getSituacaoProjeto = (situacao: string) => {
    switch (situacao) {
      case 'tramitacao':
        return 'Em Tramitação';
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'arquivado':
        return 'Arquivado';
      default:
        return situacao;
    }
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'tramitacao':
        return 'bg-primary-100 text-primary-800';
      case 'aprovado':
        return 'bg-success-100 text-success-800';
      case 'rejeitado':
        return 'bg-error-100 text-error-800';
      case 'arquivado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtrarProjetos = () => {
    return projetos.filter(projeto => {
      const passaFiltroSituacao = situacaoFilter === 'todas' || projeto.situacao === situacaoFilter;
      const passaFiltroTipo = tipoFilter === 'todas' || projeto.tipo === tipoFilter;
      return passaFiltroSituacao && passaFiltroTipo;
    });
  };

  const projetosFiltered = filtrarProjetos();

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
        <h1 className="text-2xl font-bold text-dark-500 font-title">Projetos - {nomeCamara}</h1>
        <Link 
          to={`/camara/${camaraId}/projetos/adicionar`} 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Projeto
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
            <label htmlFor="situacaoFilter" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Situação
            </label>
            <select
              id="situacaoFilter"
              value={situacaoFilter}
              onChange={(e) => setSituacaoFilter(e.target.value as SituacaoFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="todas">Todas</option>
              <option value="tramitacao">Em Tramitação</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Rejeitados</option>
              <option value="arquivado">Arquivados</option>
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
              <option value="lei">Projetos de Lei</option>
              <option value="resolucao">Projetos de Resolução</option>
              <option value="decreto">Projetos de Decreto</option>
              <option value="emenda">Emendas</option>
              <option value="outro">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : projetosFiltered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Nenhum projeto encontrado</h2>
          <p className="text-gray-600 mb-6">Não há projetos com os filtros selecionados.</p>
          <Link 
            to={`/camara/${camaraId}/projetos/adicionar`} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Projeto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projetosFiltered.map((projeto) => (
                  <tr key={projeto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-500">{projeto.numero}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{projeto.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTipoProjeto(projeto.tipo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{projeto.autor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatarData(projeto.dataApresentacao)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSituacaoColor(projeto.situacao)}`}>
                        {getSituacaoProjeto(projeto.situacao)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/camara/${camaraId}/projetos/${projeto.id}`}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          Ver detalhes
                        </Link>
                        <Link 
                          to={`/camara/${camaraId}/projetos/editar/${projeto.id}`}
                          className="text-primary-500 hover:text-primary-700"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setProjetoParaExcluir(projeto.id)}
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
      {projetoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setProjetoParaExcluir(null)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => projetoParaExcluir && handleExcluir(projetoParaExcluir)}
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