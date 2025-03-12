import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getVereadorById, deleteVereador } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';

export function DetalhesVereador() {
  const { camaraId, vereadorId } = useParams<{ camaraId: string; vereadorId: string }>();
  const navigate = useNavigate();
  
  const [vereador, setVereador] = useState<any | null>(null);
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  const [vereadorNotFound, setVereadorNotFound] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  
  useEffect(() => {
    if (camaraId && vereadorId) {
      carregarDados();
    }
  }, [camaraId, vereadorId]);
  
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
      
      // Carregar dados do vereador
      const vereadorData = getVereadorById(vereadorId!);
      if (!vereadorData) {
        setErro('Vereador não encontrado');
        setVereadorNotFound(true);
        setLoading(false);
        return;
      }
      
      setVereador(vereadorData);
      setVereadorNotFound(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExcluir = async () => {
    try {
      setExcluindo(true);
      
      await deleteVereador(vereadorId!);
      
      navigate(`/camara/${camaraId}/vereadores`);
    } catch (error) {
      console.error('Erro ao excluir vereador:', error);
      setErro('Não foi possível excluir o vereador. Tente novamente mais tarde.');
      setConfirmandoExclusao(false);
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
  
  if (vereadorNotFound) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Vereador não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar o vereador solicitado.</p>
          <Link 
            to={`/camara/${camaraId}/vereadores`} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para lista de vereadores
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
            to={`/camara/${camaraId}/vereadores`}
            className="text-primary-500 hover:text-primary-700 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Voltar para lista de vereadores
          </Link>
          <h1 className="text-2xl font-bold text-dark-500 font-title">
            Detalhes do Vereador - {nomeCamara}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/camara/${camaraId}/vereadores/${vereadorId}/editar`}
            className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
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
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
            {vereador.foto ? (
              <img 
                src={vereador.foto} 
                alt={vereador.nome} 
                className="w-full h-auto rounded-lg object-cover"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">{vereador.nome}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Cargo</p>
                <p className="text-dark-500">{getCargo(vereador.cargo)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 font-medium">Partido</p>
                <p className="text-dark-500">{vereador.partido}</p>
              </div>
              
              {vereador.email && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-dark-500">{vereador.email}</p>
                </div>
              )}
              
              {vereador.telefone && (
                <div>
                  <p className="text-sm text-gray-500 font-medium">Telefone</p>
                  <p className="text-dark-500">{vereador.telefone}</p>
                </div>
              )}
              
              <div className="col-span-2">
                <p className="text-sm text-gray-500 font-medium">Data de Cadastro</p>
                <p className="text-dark-500">{formatarData(vereador.dataCriacao)}</p>
              </div>
            </div>
            
            {vereador.biografia && (
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">Biografia</p>
                <p className="text-dark-500 whitespace-pre-line">{vereador.biografia}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este vereador? Esta ação não pode ser desfeita.
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