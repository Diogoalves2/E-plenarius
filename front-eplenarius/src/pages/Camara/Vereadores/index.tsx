import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getVereadoresByCamaraId, Vereador, deleteVereador } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';

export function ListarVereadores() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [vereadorParaExcluir, setVereadorParaExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [nomeCamara, setNomeCamara] = useState('');
  const [camaraNotFound, setCamaraNotFound] = useState(false);

  useEffect(() => {
    if (camaraId) {
      carregarDados();
    }
  }, [camaraId]);

  const carregarDados = () => {
    try {
      setLoading(true);
      setErro(null);
      
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
      
      // Carregar vereadores
      const vereadoresData = getVereadoresByCamaraId(camaraId!);
      setVereadores(vereadoresData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);
      const sucesso = deleteVereador(id);
      
      if (sucesso) {
        // Atualiza a lista removendo o vereador excluído
        setVereadores(vereadores.filter(vereador => vereador.id !== id));
        setVereadorParaExcluir(null);
      } else {
        setErro('Não foi possível excluir o vereador.');
      }
    } catch (error) {
      console.error('Erro ao excluir vereador:', error);
      setErro('Não foi possível excluir o vereador. Tente novamente mais tarde.');
    } finally {
      setExcluindo(false);
    }
  };

  const getCargo = (cargo: string) => {
    switch (cargo) {
      case 'presidente':
        return 'Presidente';
      case 'vice-presidente':
        return 'Vice-Presidente';
      case 'secretario':
        return 'Secretário';
      case 'vereador':
        return 'Vereador';
      default:
        return cargo;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Vereadores - {nomeCamara}</h1>
        <Link 
          to={`/camara/${camaraId}/vereadores/adicionar`} 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Vereador
        </Link>
      </div>

      {erro && !camaraNotFound && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      {vereadores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Nenhum vereador cadastrado</h2>
            <p className="text-gray-600 mb-6">Adicione vereadores para começar a gerenciar a câmara.</p>
            <Link 
              to={`/camara/${camaraId}/vereadores/adicionar`}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Adicionar Vereador
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vereadores.map((vereador) => (
            <div key={vereador.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {vereador.foto ? (
                    <img 
                      src={vereador.foto} 
                      alt={vereador.nome} 
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-dark-500 font-title">{vereador.nome}</h2>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        {getCargo(vereador.cargo)}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{vereador.partido}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 font-medium mb-1">Contato</p>
                  <p className="text-sm text-gray-700">{vereador.email}</p>
                  <p className="text-sm text-gray-700">{vereador.telefone}</p>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Link 
                    to={`/camara/${camaraId}/vereadores/${vereador.id}`}
                    className="text-secondary-500 hover:text-secondary-700"
                  >
                    Ver detalhes
                  </Link>
                  <Link 
                    to={`/camara/${camaraId}/vereadores/editar/${vereador.id}`}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => setVereadorParaExcluir(vereador.id)}
                    className="text-error-500 hover:text-error-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {vereadorParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este vereador? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVereadorParaExcluir(null)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => vereadorParaExcluir && handleExcluir(vereadorParaExcluir)}
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