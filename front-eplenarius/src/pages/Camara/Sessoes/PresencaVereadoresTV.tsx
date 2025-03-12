import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSessaoById } from '../../../services/sessoes';
import { getVereadoresByCamaraId } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { formatarData } from '../../../services/utils';

export function PresencaVereadoresTV() {
  const { camaraId, sessaoId } = useParams<{ camaraId: string, sessaoId: string }>();
  
  // Estados
  const [nomeCamara, setNomeCamara] = useState('');
  const [vereadores, setVereadores] = useState<any[]>([]);
  const [sessao, setSessao] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Carregar dados iniciais e configurar atualização periódica
  useEffect(() => {
    if (camaraId && sessaoId) {
      carregarDados();
      
      // Configurar atualização a cada 30 segundos
      const intervalo = setInterval(() => {
        carregarDados(false);
      }, 30000);
      
      // Limpar intervalo quando o componente for desmontado
      return () => clearInterval(intervalo);
    }
  }, [camaraId, sessaoId]);

  // Função para carregar todos os dados necessários
  const carregarDados = async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }
      setErro(null);
      
      // Carregar dados da câmara
      const camara = getCamaraById(camaraId!);
      if (!camara) {
        setNotFound(true);
        setErro('Câmara não encontrada');
        return;
      }
      setNomeCamara(camara.nome);
      
      // Carregar dados da sessão
      const sessaoData = getSessaoById(sessaoId!);
      if (!sessaoData) {
        setNotFound(true);
        setErro('Sessão não encontrada');
        return;
      }
      setSessao(sessaoData);
      
      // Inicializar vereadoresPresentes se não existir
      if (!sessaoData.vereadoresPresentes) {
        sessaoData.vereadoresPresentes = [];
      }
      
      // Carregar vereadores
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
      setErro('Ocorreu um erro ao carregar os dados. Por favor, tente novamente.');
    } finally {
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  };

  // Função para obter o cargo do vereador
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

  // Verificar se um vereador está presente
  const isVereadorPresente = (vereadorId: string) => {
    return sessao?.vereadoresPresentes?.includes(vereadorId) || false;
  };

  // Renderização de estados de carregamento e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-800 text-white p-6">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-2 font-title">
            {erro || 'Dados não encontrados'}
          </h2>
          <p className="text-gray-300 mb-6">Não foi possível encontrar os dados solicitados.</p>
        </div>
      </div>
    );
  }

  // Separar vereadores presentes e ausentes
  const vereadoresPresentes = vereadores.filter(vereador => isVereadorPresente(vereador.id));
  const vereadoresAusentes = vereadores.filter(vereador => !isVereadorPresente(vereador.id));

  return (
    <div className="min-h-screen bg-dark-800 text-white p-6">
      {/* Cabeçalho */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 font-title">{nomeCamara}</h1>
        <h2 className="text-2xl font-semibold mb-4 font-title">Lista de Presença - {sessao?.titulo}</h2>
        <div className="bg-dark-700 p-4 rounded-lg">
          <p className="text-xl mb-2">Data: {formatarData(sessao?.data)}</p>
          <p className="text-xl">Horário: {sessao?.horaInicio} - {sessao?.horaFim}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-success-900 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium mb-2">Presentes</h3>
          <p className="text-5xl font-bold">{vereadoresPresentes.length}</p>
        </div>
        <div className="bg-error-900 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium mb-2">Ausentes</h3>
          <p className="text-5xl font-bold">{vereadoresAusentes.length}</p>
        </div>
        <div className="bg-dark-700 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium mb-2">Total</h3>
          <p className="text-5xl font-bold">{vereadores.length}</p>
        </div>
      </div>

      {/* Lista de Vereadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vereadores Presentes */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-success-400 font-title">Presentes</h3>
          <div className="space-y-4">
            {vereadoresPresentes.length === 0 ? (
              <p className="text-gray-400">Nenhum vereador presente registrado.</p>
            ) : (
              vereadoresPresentes.map(vereador => (
                <div key={vereador.id} className="bg-success-900 rounded-lg p-4 flex items-center">
                  {vereador.foto ? (
                    <img 
                      src={vereador.foto} 
                      alt={vereador.nome} 
                      className="h-16 w-16 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-success-700 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold">{vereador.nome}</p>
                    <p className="text-sm text-success-200">{getCargo(vereador.cargo)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vereadores Ausentes */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-error-400 font-title">Ausentes</h3>
          <div className="space-y-4">
            {vereadoresAusentes.length === 0 ? (
              <p className="text-gray-400">Nenhum vereador ausente.</p>
            ) : (
              vereadoresAusentes.map(vereador => (
                <div key={vereador.id} className="bg-error-900 rounded-lg p-4 flex items-center">
                  {vereador.foto ? (
                    <img 
                      src={vereador.foto} 
                      alt={vereador.nome} 
                      className="h-16 w-16 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-error-700 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold">{vereador.nome}</p>
                    <p className="text-sm text-error-200">{getCargo(vereador.cargo)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rodapé com data e hora de atualização */}
      <div className="mt-8 text-center text-gray-400">
        <p>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>
  );
} 