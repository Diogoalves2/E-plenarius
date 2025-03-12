import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCamaraById, Camara, deleteCamara } from '../../services/camaras';

export function DetalhesCamara() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [camara, setCamara] = useState<Camara | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (id) {
      carregarCamara(id);
    }
  }, [id]);

  const carregarCamara = (camaraId: string) => {
    try {
      setLoading(true);
      const camaraData = getCamaraById(camaraId);
      
      if (camaraData) {
        setCamara(camaraData);
        setErro(null);
      } else {
        setErro('Câmara não encontrada');
        setCamara(null);
      }
    } catch (error) {
      console.error('Erro ao carregar câmara:', error);
      setErro('Não foi possível carregar os detalhes da câmara');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (!id) return;
    
    try {
      setExcluindo(true);
      const sucesso = await deleteCamara(id);
      
      if (sucesso) {
        navigate('/admin/camaras');
      } else {
        setErro('Não foi possível excluir a câmara');
      }
    } catch (error) {
      console.error('Erro ao excluir câmara:', error);
      setErro('Ocorreu um erro ao excluir a câmara');
    } finally {
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (erro && !camara) {
    return (
      <div className="bg-error-100 text-error-700 p-6 rounded-md">
        <h1 className="text-2xl font-bold mb-4 font-title">{erro}</h1>
        <p className="mb-4">Não foi possível encontrar a câmara solicitada.</p>
        <Link 
          to="/admin/camaras" 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  if (!camara) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link 
          to="/admin/camaras" 
          className="text-secondary-500 hover:text-secondary-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-dark-500 font-title">Detalhes da Câmara</h1>
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      {camara && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Cabeçalho com imagem e ações */}
          <div className="relative">
            {camara.imagem ? (
              <div className="h-48 bg-secondary-100">
                <img 
                  src={camara.imagem} 
                  alt={camara.nome} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-secondary-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Link
                to={`/admin/camaras/editar/${camara.id}`}
                className="bg-white text-primary-500 hover:text-primary-700 p-2 rounded-full shadow-md"
                title="Editar Câmara"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="bg-white text-error-500 hover:text-error-700 p-2 rounded-full shadow-md"
                title="Excluir Câmara"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              <Link
                to={`/camara/${camara.id}/dashboard`}
                className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full shadow-md"
                title="Acessar Painel da Câmara"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Informações Básicas</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
                    <p className="text-dark-500">{camara.cnpj}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
                    <p className="text-dark-500">{formatarData(camara.dataCriacao)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                    <p className="text-dark-500">{camara.endereco || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Cidade/Estado</h3>
                    <p className="text-dark-500">{camara.cidade}/{camara.estado}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">CEP</h3>
                    <p className="text-dark-500">{camara.cep || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                    <p className="text-dark-500">{camara.telefone || 'Não informado'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-dark-500">{camara.email || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              {/* Vereadores */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Vereadores</h2>
                
                {camara.vereadores.length === 0 ? (
                  <p className="text-gray-500">Nenhum vereador cadastrado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {camara.vereadores.map(vereador => (
                      <div key={vereador.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          {vereador.foto ? (
                            <img 
                              src={vereador.foto} 
                              alt={vereador.nome} 
                              className="h-12 w-12 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-500 text-xs">Sem foto</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium text-dark-500">{vereador.nome}</h3>
                            <p className="text-sm text-gray-500">{vereador.cargo}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <p className="text-gray-600">{vereador.email}</p>
                          {vereador.isPresidente && (
                            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                              Presidente
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Imagem e Documentos */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Imagem</h2>
                
                {camara.imagem ? (
                  <img 
                    src={camara.imagem} 
                    alt={camara.nome} 
                    className="w-full h-auto rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Regimento Interno</h2>
                
                {camara.regimentoInterno ? (
                  <div>
                    <p className="text-gray-600 mb-3">O regimento interno está disponível para download.</p>
                    <a 
                      href={camara.regimentoInterno} 
                      download={`regimento-interno-${camara.nome}.pdf`}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Baixar Regimento
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum regimento interno cadastrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a câmara <span className="font-medium">{camara.nome}</span>? Esta ação não pode ser desfeita.
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