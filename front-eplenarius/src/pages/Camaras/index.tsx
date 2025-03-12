import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCamaras, Camara, deleteCamara } from '../../services/camaras';

export function Camaras() {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraParaExcluir, setCamaraParaExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    carregarCamaras();
  }, []);

  const carregarCamaras = () => {
    try {
      setLoading(true);
      const camarasData = getCamaras();
      setCamaras(camarasData);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar câmaras:', error);
      setErro('Não foi possível carregar as câmaras. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
    try {
      setExcluindo(true);
      await deleteCamara(id);
      setCamaras(camaras.filter(camara => camara.id !== id));
      setCamaraParaExcluir(null);
    } catch (error) {
      console.error('Erro ao excluir câmara:', error);
      setErro('Não foi possível excluir a câmara. Tente novamente mais tarde.');
    } finally {
      setExcluindo(false);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Câmaras</h1>
        <Link 
          to="/admin/camaras/adicionar" 
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Câmara
        </Link>
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : camaras.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Nenhuma câmara cadastrada</h2>
          <p className="text-gray-600 mb-6">Clique no botão "Nova Câmara" para adicionar uma câmara.</p>
          <Link 
            to="/admin/camaras/adicionar" 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Câmara
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camaras.map(camara => (
            <div key={camara.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {camara.imagem ? (
                  <img 
                    src={camara.imagem} 
                    alt={camara.nome} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-lg font-semibold text-dark-500 mb-2 font-title">{camara.nome}</h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Cidade:</span> {camara.cidade}/{camara.estado}</p>
                  <p><span className="font-medium">CNPJ:</span> {camara.cnpj}</p>
                  <p><span className="font-medium">Vereadores:</span> {camara.vereadores.length}</p>
                  <p><span className="font-medium">Data de cadastro:</span> {formatarData(camara.dataCriacao)}</p>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <Link 
                    to={`/admin/camaras/${camara.id}`}
                    className="text-secondary-500 hover:text-secondary-700 font-medium text-sm"
                  >
                    Ver detalhes
                  </Link>
                  
                  <button
                    onClick={() => setCamaraParaExcluir(camara.id)}
                    className="text-error-500 hover:text-error-700 font-medium text-sm"
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
      {camaraParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta câmara? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCamaraParaExcluir(null)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={excluindo}
              >
                Cancelar
              </button>
              <button
                onClick={() => camaraParaExcluir && handleExcluir(camaraParaExcluir)}
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