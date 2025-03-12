import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSessaoById, registrarPresencaVereador, removerPresencaVereador } from '../../../services/sessoes';
import { getVereadoresByCamaraId, Vereador } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { formatarData } from '../../../services/utils';

export function PresencaVereadores() {
  const { camaraId, sessaoId } = useParams<{ camaraId: string; sessaoId: string }>();
  const navigate = useNavigate();
  
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [vereadoresPresentes, setVereadoresPresentes] = useState<string[]>([]);
  const [nomeCamara, setNomeCamara] = useState('');
  const [tituloSessao, setTituloSessao] = useState('');
  const [dataSessao, setDataSessao] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  const [sessaoNotFound, setSessaoNotFound] = useState(false);
  const [sucessoSalvar, setSucessoSalvar] = useState(false);

  useEffect(() => {
    if (camaraId && sessaoId) {
      carregarDados();
    }
  }, [camaraId, sessaoId]);

  const carregarDados = async () => {
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
      
      // Carregar dados da sessão
      const sessaoData = getSessaoById(sessaoId!);
      if (!sessaoData) {
        setErro('Sessão não encontrada');
        setSessaoNotFound(true);
        setLoading(false);
        return;
      }
      
      setTituloSessao(sessaoData.titulo);
      setDataSessao(new Date(sessaoData.data));
      setVereadoresPresentes(sessaoData.vereadoresPresentes || []);
      setSessaoNotFound(false);
      
      // Carregar vereadores da câmara
      const vereadoresData = getVereadoresByCamaraId(camaraId!);
      setVereadores(vereadoresData);
      
      console.log('Dados carregados:', {
        camara,
        sessao: sessaoData,
        vereadores: vereadoresData,
        vereadoresPresentes: sessaoData.vereadoresPresentes
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePresenca = async (vereadorId: string) => {
    try {
      setSalvando(true);
      setErro(null);
      setSucessoSalvar(false);
      
      if (!vereadoresPresentes.includes(vereadorId)) {
        // Adicionar presença
        await registrarPresencaVereador(sessaoId!, vereadorId);
        setVereadoresPresentes(prev => [...prev, vereadorId]);
      } else {
        // Remover presença
        await removerPresencaVereador(sessaoId!, vereadorId);
        setVereadoresPresentes(prev => prev.filter(id => id !== vereadorId));
      }
      
      // Recarregar dados
      await carregarDados();
      
      setSucessoSalvar(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSucessoSalvar(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao alterar presença:', error);
      setErro('Não foi possível alterar a presença do vereador.');
    } finally {
      setSalvando(false);
    }
  };

  const handleSalvarTodos = async () => {
    try {
      setSalvando(true);
      setErro(null);
      
      // Recarregar dados para garantir que estamos com os dados mais recentes
      await carregarDados();
      
      setSucessoSalvar(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSucessoSalvar(false);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar presenças:', error);
      setErro('Não foi possível salvar as presenças. Tente novamente mais tarde.');
    } finally {
      setSalvando(false);
    }
  };

  const formatarData = (data: Date | null) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
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

  if (sessaoNotFound) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Sessão não encontrada</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar a sessão solicitada.</p>
          <Link 
            to={`/camara/${camaraId}/sessoes`} 
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar para lista de sessões
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
            to={`/camara/${camaraId}/sessoes/${sessaoId}`}
            className="text-primary-500 hover:text-primary-700 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Voltar para detalhes da sessão
          </Link>
          <h1 className="text-2xl font-bold text-dark-500 font-title">Lista de Presença - {tituloSessao}</h1>
          <p className="text-gray-600">Data: {formatarData(dataSessao)}</p>
        </div>
        <button
          onClick={handleSalvarTodos}
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          disabled={salvando}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {salvando ? 'Salvando...' : 'Salvar Presenças'}
        </button>
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      {sucessoSalvar && (
        <div className="bg-success-100 text-success-700 p-3 rounded-md mb-4 text-sm">
          Presenças salvas com sucesso!
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dark-500 font-title">Vereadores Presentes ({vereadoresPresentes.length})</h2>
          <div className="text-sm text-gray-500">
            Total: {vereadoresPresentes.length} de {vereadores.length} vereadores
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {vereadores.filter(v => vereadoresPresentes.includes(v.id)).map(vereador => (
            <div key={vereador.id} className="flex items-center p-3 border border-success-200 bg-success-50 rounded-md">
              <div className="flex-shrink-0 mr-3">
                {vereador.foto ? (
                  <img 
                    src={vereador.foto} 
                    alt={vereador.nome} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-dark-500 font-medium">{vereador.nome}</h3>
                <p className="text-sm text-gray-600">{getCargo(vereador.cargo)} • {vereador.partido}</p>
              </div>
              <button
                onClick={() => handleTogglePresenca(vereador.id)}
                className="ml-2 p-1 rounded-full bg-success-100 text-success-700 hover:bg-success-200"
                title="Marcar como ausente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dark-500 font-title">Vereadores Ausentes ({vereadores.length - vereadoresPresentes.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vereadores.filter(v => !vereadoresPresentes.includes(v.id)).map(vereador => (
            <div key={vereador.id} className="flex items-center p-3 border border-gray-200 bg-gray-50 rounded-md">
              <div className="flex-shrink-0 mr-3">
                {vereador.foto ? (
                  <img 
                    src={vereador.foto} 
                    alt={vereador.nome} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-dark-500 font-medium">{vereador.nome}</h3>
                <p className="text-sm text-gray-600">{getCargo(vereador.cargo)} • {vereador.partido}</p>
              </div>
              <button
                onClick={() => handleTogglePresenca(vereador.id)}
                className="ml-2 p-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Marcar como presente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 