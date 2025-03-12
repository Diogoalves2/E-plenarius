import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjetoById, deleteProjeto, Projeto } from '../../../services/projetos';
import { getCamaraById } from '../../../services/camaras';
import { getSessaoById } from '../../../services/sessoes';

export function DetalhesProjeto() {
  const { camaraId, projetoId } = useParams<{ camaraId: string; projetoId: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  const [projetoNotFound, setProjetoNotFound] = useState(false);
  const [sessoes, setSessoes] = useState<{ id: string; titulo: string; data: Date }[]>([]);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (camaraId && projetoId) {
      carregarDados();
    }
  }, [camaraId, projetoId]);

  const carregarDados = () => {
    try {
      setLoading(true);
      
      // Carregar dados da câmara
      const camara = getCamaraById(camaraId!);
      if (!camara) {
        setErro('Câmara não encontrada');
        setCamaraNotFound(true);
        setLoading(false);
        return;
      }
      
      setNomeCamara(camara.nome);
      setCamaraNotFound(false);
      
      // Carregar dados do projeto
      const projetoData = getProjetoById(projetoId!);
      if (!projetoData) {
        setErro('Projeto não encontrado');
        setProjetoNotFound(true);
        setLoading(false);
        return;
      }
      
      setProjeto(projetoData);
      setProjetoNotFound(false);
      
      // Carregar dados das sessões vinculadas
      if (projetoData.sessaoIds.length > 0) {
        const sessoesVinculadas = projetoData.sessaoIds.map(sessaoId => {
          const sessao = getSessaoById(sessaoId);
          if (sessao) {
            return {
              id: sessao.id,
              titulo: sessao.titulo,
              data: sessao.data
            };
          }
          return null;
        }).filter(sessao => sessao !== null) as { id: string; titulo: string; data: Date }[];
        
        setSessoes(sessoesVinculadas);
      }
      
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error);
      setErro('Não foi possível carregar os dados do projeto. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    try {
      setExcluindo(true);
      
      if (!projetoId) return;
      
      const sucesso = deleteProjeto(projetoId);
      
      if (sucesso) {
        navigate(`/camara/${camaraId}/projetos`);
      } else {
        setErro('Não foi possível excluir o projeto.');
        setConfirmandoExclusao(false);
      }
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      setErro('Não foi possível excluir o projeto. Tente novamente mais tarde.');
      setConfirmandoExclusao(false);
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

  if (projetoNotFound) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Projeto não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar o projeto solicitado.</p>
          <Link 
            to={`/camara/${camaraId}/projetos`} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para lista de projetos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            to={`/camara/${camaraId}/projetos`}
            className="text-primary-500 hover:text-primary-700 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Voltar para lista de projetos
          </Link>
          <h1 className="text-2xl font-bold text-dark-500 font-title">
            Detalhes do Projeto - {nomeCamara}
          </h1>
        </div>
        {!editando && (
          <div className="flex gap-2">
            <Link 
              to={`/camara/${camaraId}/projetos/editar/${projetoId}`}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Link>
            
            {/* Botão para iniciar votação */}
            <Link 
              to={`/camara/${camaraId}/sessoes/${projeto.sessaoId}/projetos/${projetoId}/votacao`}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Iniciar Votação
            </Link>
            
            <button
              onClick={() => setConfirmandoExclusao(true)}
              className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir
            </button>
          </div>
        )}
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Informações Gerais</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 font-medium">Número</p>
                <p className="text-dark-500">{projeto?.numero}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Tipo</p>
                <p className="text-dark-500">{getTipoProjeto(projeto?.tipo || '')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Autor</p>
                <p className="text-dark-500">{projeto?.autor}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Data de Apresentação</p>
                <p className="text-dark-500">{formatarData(projeto?.dataApresentacao || new Date())}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Situação</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSituacaoColor(projeto?.situacao || '')}`}>
                  {getSituacaoProjeto(projeto?.situacao || '')}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Descrição</h2>
            <p className="text-dark-500 whitespace-pre-line">{projeto?.descricao || 'Nenhuma descrição disponível.'}</p>
          </div>
        </div>
      </div>

      {/* Sessões Vinculadas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Sessões Vinculadas</h2>
        
        {sessoes.length === 0 ? (
          <p className="text-gray-500">Este projeto não está vinculado a nenhuma sessão.</p>
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessoes.map((sessao) => (
                  <tr key={sessao.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-500">{sessao.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatarData(sessao.data)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/camara/${camaraId}/sessoes/${sessao.id}`}
                        className="text-primary-500 hover:text-primary-700"
                      >
                        Ver sessão
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Anexos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Anexos</h2>
        
        {projeto?.anexos.length === 0 ? (
          <p className="text-gray-500">Nenhum anexo disponível.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projeto?.anexos.map((anexo, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <a 
                  href={anexo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-700 text-sm"
                >
                  Anexo {index + 1}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
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