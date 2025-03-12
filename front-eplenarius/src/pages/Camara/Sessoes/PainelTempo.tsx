import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getTempoDebate, 
  iniciarTempoDebate, 
  liberarTempo, 
  pausarTempo, 
  retomarTempo, 
  finalizarTempo, 
  atualizarTempoRestante, 
  resetarTempoDebate,
  abrirInscricoes,
  fecharInscricoes,
  removerInscricao,
  limparInscricoes,
  TempoDebate,
  Inscricao
} from '../../../services/tempoDebate';
import { getVereadorById } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { getSessaoById } from '../../../services/sessoes';

export function PainelTempo() {
  const { camaraId, sessaoId } = useParams<{ camaraId: string, sessaoId: string }>();
  const [tempoDebate, setTempoDebate] = useState<TempoDebate | null>(null);
  const [vereadores, setVereadores] = useState<any[]>([]);
  const [vereadorSelecionado, setVereadorSelecionado] = useState<string>('');
  const [tempoTotal, setTempoTotal] = useState<number>(300); // 5 minutos por padrão
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nomeCamara, setNomeCamara] = useState<string>('');
  const [nomeSessao, setNomeSessao] = useState<string>('');
  const [vereadorAtual, setVereadorAtual] = useState<any>(null);
  const [inscricoesAbertas, setInscricoesAbertas] = useState<boolean>(false);

  // Formatar o tempo em minutos e segundos
  const formatarTempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      if (!camaraId || !sessaoId) {
        setErro('Parâmetros inválidos');
        setLoading(false);
        return;
      }

      try {
        // Carregar câmara
        const camara = getCamaraById(camaraId);
        if (!camara) {
          setErro('Câmara não encontrada');
          setLoading(false);
          return;
        }
        setNomeCamara(camara.nome);

        // Carregar sessão
        const sessao = getSessaoById(sessaoId);
        if (!sessao) {
          setErro('Sessão não encontrada');
          setLoading(false);
          return;
        }
        setNomeSessao(sessao.titulo);

        // Carregar vereadores
        setVereadores(camara.vereadores || []);

        // Carregar ou iniciar tempo de debate
        let tempo = getTempoDebate(sessaoId);
        if (!tempo) {
          tempo = iniciarTempoDebate(sessaoId, tempoTotal);
        }
        setTempoDebate(tempo);
        setInscricoesAbertas(tempo.inscricoesAbertas);

        // Se houver um vereador com tempo ativo, carregar seus dados
        if (tempo.vereadorId) {
          const vereador = camara.vereadores.find(v => v.id === tempo.vereadorId);
          if (vereador) {
            setVereadorAtual(vereador);
            setVereadorSelecionado(vereador.id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setErro('Erro ao carregar dados. Tente novamente.');
        setLoading(false);
      }
    };

    carregarDados();
  }, [camaraId, sessaoId, tempoTotal]);

  // Atualizar o tempo restante a cada segundo
  useEffect(() => {
    if (!sessaoId || !tempoDebate || !tempoDebate.ativo || tempoDebate.pausado) return;

    const timer = setInterval(() => {
      const tempoAtualizado = atualizarTempoRestante(sessaoId);
      if (tempoAtualizado) {
        setTempoDebate(tempoAtualizado);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessaoId, tempoDebate]);

  // Função para liberar o tempo para um vereador
  const handleLiberarTempo = () => {
    if (!sessaoId || !vereadorSelecionado) return;

    const vereador = vereadores.find(v => v.id === vereadorSelecionado);
    if (!vereador) return;

    const tempoAtualizado = liberarTempo(
      sessaoId, 
      vereador.id, 
      vereador.nome, 
      vereador.partido || 'Sem partido',
      vereador.foto
    );

    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setVereadorAtual(vereador);
    }
  };

  // Função para pausar o tempo
  const handlePausarTempo = () => {
    if (!sessaoId) return;

    const tempoAtualizado = pausarTempo(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
    }
  };

  // Função para retomar o tempo
  const handleRetomarTempo = () => {
    if (!sessaoId) return;

    const tempoAtualizado = retomarTempo(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
    }
  };

  // Função para finalizar o tempo
  const handleFinalizarTempo = () => {
    if (!sessaoId) return;

    const tempoAtualizado = finalizarTempo(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setVereadorAtual(null);
      setVereadorSelecionado('');
    }
  };

  // Função para resetar o tempo de debate
  const handleResetarTempo = () => {
    if (!sessaoId) return;

    const tempoAtualizado = resetarTempoDebate(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setVereadorAtual(null);
      setVereadorSelecionado('');
      setInscricoesAbertas(false);
    }
  };

  // Função para alterar o tempo total
  const handleAlterarTempoTotal = (novoTempo: number) => {
    setTempoTotal(novoTempo);
    if (sessaoId && (!tempoDebate || !tempoDebate.ativo)) {
      const tempoAtualizado = iniciarTempoDebate(sessaoId, novoTempo);
      setTempoDebate(tempoAtualizado);
    }
  };

  // Função para abrir inscrições
  const handleAbrirInscricoes = () => {
    if (!sessaoId) return;

    const tempoAtualizado = abrirInscricoes(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setInscricoesAbertas(true);
    }
  };

  // Função para fechar inscrições
  const handleFecharInscricoes = () => {
    if (!sessaoId) return;

    const tempoAtualizado = fecharInscricoes(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setInscricoesAbertas(false);
    }
  };

  // Função para remover inscrição
  const handleRemoverInscricao = (vereadorId: string) => {
    if (!sessaoId) return;

    const tempoAtualizado = removerInscricao(sessaoId, vereadorId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
    }
  };

  // Função para limpar todas as inscrições
  const handleLimparInscricoes = () => {
    if (!sessaoId) return;

    const tempoAtualizado = limparInscricoes(sessaoId);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
    }
  };

  // Obter vereador pelo ID
  const getVereador = (vereadorId: string) => {
    return vereadores.find(v => v.id === vereadorId);
  };

  // Obter inscrições não atendidas
  const getInscricoesNaoAtendidas = () => {
    if (!tempoDebate || !tempoDebate.inscricoes) return [];
    return tempoDebate.inscricoes
      .filter(i => !i.atendido)
      .sort((a, b) => a.ordem - b.ordem);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
        {erro}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Painel de Tempo de Debate</h1>
        <div className="flex space-x-2">
          <Link
            to={`/tv/camara/${camaraId}/sessoes/${sessaoId}/tempo`}
            target="_blank"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Painel de Tempo
          </Link>
          <Link
            to={`/camara/${camaraId}/sessoes/${sessaoId}`}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Voltar para Sessão
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de controle */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Controle de Tempo</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo Total (minutos)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 5, 10, 15].map(tempo => (
                <button
                  key={tempo}
                  onClick={() => handleAlterarTempoTotal(tempo * 60)}
                  disabled={tempoDebate?.ativo}
                  className={`px-3 py-1 rounded-md ${
                    tempoTotal === tempo * 60
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${tempoDebate?.ativo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {tempo}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="vereador" className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Vereador
            </label>
            <select
              id="vereador"
              value={vereadorSelecionado}
              onChange={(e) => setVereadorSelecionado(e.target.value)}
              disabled={tempoDebate?.ativo}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecione um vereador</option>
              {vereadores.map(vereador => (
                <option key={vereador.id} value={vereador.id}>
                  {vereador.nome} {vereador.partido ? `(${vereador.partido})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {!tempoDebate?.ativo ? (
              <button
                onClick={handleLiberarTempo}
                disabled={!vereadorSelecionado}
                className={`px-4 py-2 rounded-md ${
                  !vereadorSelecionado
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Liberar Tempo
              </button>
            ) : (
              <>
                {tempoDebate.pausado ? (
                  <button
                    onClick={handleRetomarTempo}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                  >
                    Retomar
                  </button>
                ) : (
                  <button
                    onClick={handlePausarTempo}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                  >
                    Pausar
                  </button>
                )}
                <button
                  onClick={handleFinalizarTempo}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                >
                  Finalizar
                </button>
              </>
            )}
            <button
              onClick={handleResetarTempo}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
            >
              Resetar
            </button>
          </div>

          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Tempo Restante</div>
            <div className="text-4xl font-bold text-gray-800">
              {tempoDebate ? formatarTempo(tempoDebate.tempoRestante) : '00:00'}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {tempoDebate?.ativo
                ? tempoDebate.pausado
                  ? 'Pausado'
                  : 'Em andamento'
                : 'Aguardando'}
            </div>
          </div>
        </div>

        {/* Prévia do painel */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-primary-700 text-white p-4">
            <h2 className="text-xl font-bold">{nomeCamara}</h2>
            <p className="text-sm">{nomeSessao}</p>
          </div>
          
          {vereadorAtual ? (
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200">
                  {vereadorAtual.foto ? (
                    <img 
                      src={vereadorAtual.foto} 
                      alt={vereadorAtual.nome} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{vereadorAtual.nome}</h3>
                <p className="text-sm text-gray-500 mb-4">{vereadorAtual.partido || 'Sem partido'}</p>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className={`h-4 rounded-full ${tempoDebate?.pausado ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ 
                      width: `${tempoDebate ? (tempoDebate.tempoRestante / tempoDebate.tempoTotal) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="text-3xl font-bold text-gray-800">
                  {tempoDebate ? formatarTempo(tempoDebate.tempoRestante) : '00:00'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center h-64 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg">Aguardando liberação de tempo</p>
            </div>
          )}
        </div>

        {/* Controle de inscrições */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Inscrições para Debate</h2>
            <div>
              {inscricoesAbertas ? (
                <button
                  onClick={handleFecharInscricoes}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md"
                >
                  Fechar Inscrições
                </button>
              ) : (
                <button
                  onClick={handleAbrirInscricoes}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md"
                >
                  Abrir Inscrições
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className={`p-2 rounded-md text-sm ${inscricoesAbertas ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {inscricoesAbertas 
                ? 'Inscrições abertas. Os vereadores podem se inscrever para falar.' 
                : 'Inscrições fechadas. Apenas o presidente pode liberar o tempo.'}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Lista de Inscritos</h3>
            
            {getInscricoesNaoAtendidas().length === 0 ? (
              <p className="text-gray-500 text-sm italic">Nenhum vereador inscrito.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getInscricoesNaoAtendidas().map((inscricao, index) => {
                  const vereador = getVereador(inscricao.vereadorId);
                  if (!vereador) return null;
                  
                  return (
                    <div key={inscricao.vereadorId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                          {vereador.foto ? (
                            <img 
                              src={vereador.foto} 
                              alt={vereador.nome} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{vereador.nome}</div>
                          <div className="text-xs text-gray-500">{vereador.partido || 'Sem partido'}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setVereadorSelecionado(vereador.id);
                            handleLiberarTempo();
                          }}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                          disabled={tempoDebate?.ativo}
                        >
                          Liberar
                        </button>
                        <button
                          onClick={() => handleRemoverInscricao(vereador.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {getInscricoesNaoAtendidas().length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleLimparInscricoes}
                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md"
              >
                Limpar Todas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de tempos */}
      {tempoDebate && tempoDebate.historico.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Histórico de Tempos</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vereador
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo Utilizado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Início
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fim
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tempoDebate.historico.map((item, index) => {
                  const vereador = vereadores.find(v => v.id === item.vereadorId);
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                            {vereador?.foto ? (
                              <img 
                                src={vereador.foto} 
                                alt={vereador.nome} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {vereador?.nome || 'Vereador não encontrado'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vereador?.partido || 'Sem partido'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatarTempo(item.tempoUtilizado)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(item.dataInicio).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(item.dataFim).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 