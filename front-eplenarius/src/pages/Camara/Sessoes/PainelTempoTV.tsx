import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getTempoDebate, 
  atualizarTempoRestante, 
  inscreverVereador,
  TempoDebate 
} from '../../../services/tempoDebate';
import { getCamaraById } from '../../../services/camaras';
import { getSessaoById } from '../../../services/sessoes';

export function PainelTempoTV() {
  const { camaraId, sessaoId } = useParams<{ camaraId: string, sessaoId: string }>();
  const [tempoDebate, setTempoDebate] = useState<TempoDebate | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [nomeCamara, setNomeCamara] = useState<string>('');
  const [nomeSessao, setNomeSessao] = useState<string>('');
  const [vereadorAtual, setVereadorAtual] = useState<any>(null);
  const [vereadores, setVereadores] = useState<any[]>([]);
  const [vereadorSelecionado, setVereadorSelecionado] = useState<string>('');
  const [inscricaoEnviada, setInscricaoEnviada] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

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
        setVereadores(camara.vereadores || []);

        // Carregar sessão
        const sessao = getSessaoById(sessaoId);
        if (!sessao) {
          setErro('Sessão não encontrada');
          setLoading(false);
          return;
        }
        setNomeSessao(sessao.titulo);

        // Carregar tempo de debate
        const tempo = getTempoDebate(sessaoId);
        if (tempo) {
          setTempoDebate(tempo);

          // Se houver um vereador com tempo ativo, carregar seus dados
          if (tempo.vereadorId) {
            const vereador = camara.vereadores.find(v => v.id === tempo.vereadorId);
            if (vereador) {
              setVereadorAtual(vereador);
            }
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

    // Configurar polling para atualizar os dados a cada segundo
    const interval = setInterval(() => {
      if (camaraId && sessaoId) {
        const tempo = getTempoDebate(sessaoId);
        if (tempo) {
          setTempoDebate(tempo);

          // Verificar se o vereador mudou
          if (tempo.vereadorId !== tempoDebate?.vereadorId) {
            const camara = getCamaraById(camaraId);
            if (camara && tempo.vereadorId) {
              const vereador = camara.vereadores.find(v => v.id === tempo.vereadorId);
              if (vereador) {
                setVereadorAtual(vereador);
              } else {
                setVereadorAtual(null);
              }
            } else {
              setVereadorAtual(null);
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [camaraId, sessaoId]);

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

  // Função para inscrever um vereador
  const handleInscreverVereador = () => {
    if (!sessaoId || !vereadorSelecionado) {
      setMensagem('Selecione um vereador para se inscrever.');
      return;
    }

    // Verificar se as inscrições estão abertas
    if (!tempoDebate?.inscricoesAbertas) {
      setMensagem('As inscrições estão fechadas no momento.');
      return;
    }

    // Verificar se o vereador já está inscrito
    if (tempoDebate.inscricoes && tempoDebate.inscricoes.some(i => i.vereadorId === vereadorSelecionado && !i.atendido)) {
      setMensagem('Este vereador já está inscrito.');
      return;
    }

    const tempoAtualizado = inscreverVereador(sessaoId, vereadorSelecionado);
    if (tempoAtualizado) {
      setTempoDebate(tempoAtualizado);
      setInscricaoEnviada(true);
      setMensagem('Inscrição realizada com sucesso!');
      
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setMensagem(null);
      }, 3000);
    } else {
      setMensagem('Não foi possível realizar a inscrição. Tente novamente.');
    }
  };

  // Obter inscrições não atendidas
  const getInscricoesNaoAtendidas = () => {
    if (!tempoDebate || !tempoDebate.inscricoes) return [];
    return tempoDebate.inscricoes
      .filter(i => !i.atendido)
      .sort((a, b) => a.ordem - b.ordem);
  };

  // Verificar se um vereador está inscrito
  const isVereadorInscrito = (vereadorId: string) => {
    if (!tempoDebate || !tempoDebate.inscricoes) return false;
    return tempoDebate.inscricoes.some(i => i.vereadorId === vereadorId && !i.atendido);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="bg-red-800 text-white p-6 rounded-md max-w-md">
          <h2 className="text-xl font-bold mb-2">Erro</h2>
          <p>{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Cabeçalho */}
      <header className="bg-primary-700 p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">{nomeCamara}</h1>
          <p className="text-xl">{nomeSessao}</p>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto p-6">
        {vereadorAtual && tempoDebate?.ativo ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-48 h-48 rounded-full overflow-hidden mb-8 bg-gray-700">
              {vereadorAtual.foto ? (
                <img 
                  src={vereadorAtual.foto} 
                  alt={vereadorAtual.nome} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h2 className="text-4xl font-bold mb-2">{vereadorAtual.nome}</h2>
            <p className="text-2xl text-gray-300 mb-8">{vereadorAtual.partido || 'Sem partido'}</p>
            
            <div className="w-full max-w-2xl bg-gray-700 rounded-full h-8 mb-6">
              <div 
                className={`h-8 rounded-full ${tempoDebate.pausado ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ 
                  width: `${(tempoDebate.tempoRestante / tempoDebate.tempoTotal) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="text-7xl font-bold">
              {formatarTempo(tempoDebate.tempoRestante)}
            </div>
            
            {tempoDebate.pausado && (
              <div className="mt-6 text-2xl text-yellow-500 animate-pulse">
                TEMPO PAUSADO
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-600 mb-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-400 mb-8">Aguardando próximo orador</h2>
            
            {/* Seção de inscrição */}
            {tempoDebate?.inscricoesAbertas && (
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-center">Inscrição para Debate</h3>
                
                {mensagem && (
                  <div className={`p-3 rounded-md mb-4 text-sm ${
                    mensagem.includes('sucesso') ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
                  }`}>
                    {mensagem}
                  </div>
                )}
                
                {inscricaoEnviada ? (
                  <div className="text-center">
                    <div className="bg-green-800 text-green-100 p-4 rounded-md mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">Inscrição realizada!</p>
                      <p className="text-sm mt-2">Aguarde sua vez de falar.</p>
                    </div>
                    
                    <button
                      onClick={() => setInscricaoEnviada(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Nova Inscrição
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label htmlFor="vereador" className="block text-sm font-medium text-gray-300 mb-1">
                        Selecione seu nome
                      </label>
                      <select
                        id="vereador"
                        value={vereadorSelecionado}
                        onChange={(e) => setVereadorSelecionado(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Selecione um vereador</option>
                        {vereadores.map(vereador => (
                          <option 
                            key={vereador.id} 
                            value={vereador.id}
                            disabled={isVereadorInscrito(vereador.id)}
                          >
                            {vereador.nome} {vereador.partido ? `(${vereador.partido})` : ''} 
                            {isVereadorInscrito(vereador.id) ? ' - Já inscrito' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      onClick={handleInscreverVereador}
                      disabled={!vereadorSelecionado || !tempoDebate?.inscricoesAbertas}
                      className={`w-full py-2 rounded-md transition-colors ${
                        !vereadorSelecionado || !tempoDebate?.inscricoesAbertas
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700'
                      }`}
                    >
                      Inscrever-se para Falar
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Lista de inscritos */}
            {getInscricoesNaoAtendidas().length > 0 && (
              <div className="mt-8 bg-gray-800 p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4 text-center">Lista de Inscritos</h3>
                <div className="space-y-2">
                  {getInscricoesNaoAtendidas().map((inscricao, index) => {
                    const vereador = vereadores.find(v => v.id === inscricao.vereadorId);
                    if (!vereador) return null;
                    
                    return (
                      <div key={inscricao.vereadorId} className="flex items-center p-2 bg-gray-700 rounded-md">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-600 mr-3">
                          {vereador.foto ? (
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
                        <div>
                          <div className="text-white font-medium">{index + 1}. {vereador.nome}</div>
                          <div className="text-gray-400 text-sm">{vereador.partido || 'Sem partido'}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 p-4 fixed bottom-0 w-full">
        <div className="container mx-auto text-center text-gray-400">
          <p>E-Plenarius - Sistema de Gestão Legislativa</p>
        </div>
      </footer>
    </div>
  );
} 