import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSessaoById } from '../../../services/sessoes';
import { getProjetoById } from '../../../services/projetos';
import { getVereadoresByCamaraId, Vereador } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { 
  getVotosBySessaoAndProjeto, 
  calcularResultadoVotacao,
  TipoVoto,
  ResultadoVotacao
} from '../../../services/votacao';

export function VotacaoVereadoresTV() {
  const { camaraId, sessaoId, projetoId } = useParams<{ camaraId: string; sessaoId: string; projetoId: string }>();
  
  const [nomeCamara, setNomeCamara] = useState('');
  const [sessao, setSessao] = useState<any | null>(null);
  const [projeto, setProjeto] = useState<any | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [votos, setVotos] = useState<Record<string, TipoVoto>>({});
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (camaraId && sessaoId && projetoId) {
      carregarDados();
    }
  }, [camaraId, sessaoId, projetoId]);
  
  // Efeito para atualizar dados a cada 5 segundos
  useEffect(() => {
    if (!camaraId || !sessaoId || !projetoId) return;
    
    const interval = setInterval(() => {
      atualizarVotos();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [camaraId, sessaoId, projetoId, vereadores.length]);
  
  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      // Carregar dados da câmara
      const camara = getCamaraById(camaraId!);
      if (!camara) {
        setErro('Câmara não encontrada');
        setLoading(false);
        return;
      }
      setNomeCamara(camara.nome);
      
      // Carregar dados da sessão
      const sessaoData = getSessaoById(sessaoId!);
      if (!sessaoData) {
        setErro('Sessão não encontrada');
        setLoading(false);
        return;
      }
      setSessao(sessaoData);
      
      // Carregar dados do projeto
      const projetoData = getProjetoById(projetoId!);
      if (!projetoData) {
        setErro('Projeto não encontrado');
        setLoading(false);
        return;
      }
      setProjeto(projetoData);
      
      // Carregar vereadores
      const vereadoresData = getVereadoresByCamaraId(camaraId!);
      setVereadores(vereadoresData);
      
      // Carregar votos existentes
      await atualizarVotos();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const atualizarVotos = async () => {
    try {
      // Carregar votos existentes
      const votosExistentes = getVotosBySessaoAndProjeto(sessaoId!, projetoId!);
      const votosMap: Record<string, TipoVoto> = {};
      
      votosExistentes.forEach(voto => {
        votosMap[voto.vereadorId] = voto.voto;
      });
      
      setVotos(votosMap);
      
      // Calcular resultado atual
      const resultadoAtual = calcularResultadoVotacao(
        sessaoId!, 
        projetoId!, 
        vereadores.length
      );
      setResultado(resultadoAtual);
      
    } catch (error) {
      console.error('Erro ao atualizar votos:', error);
    }
  };
  
  const getCorVoto = (tipoVoto: TipoVoto) => {
    switch (tipoVoto) {
      case 'favoravel':
        return 'bg-green-500 text-white';
      case 'contrario':
        return 'bg-red-500 text-white';
      case 'abstencao':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  const getTextoVoto = (tipoVoto: TipoVoto) => {
    switch (tipoVoto) {
      case 'favoravel':
        return 'SIM';
      case 'contrario':
        return 'NÃO';
      case 'abstencao':
        return 'ABSTENÇÃO';
      default:
        return 'NÃO VOTOU';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }
  
  if (erro || !sessao || !projeto) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-dark-900 text-white p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold mb-4">Erro ao carregar dados</h1>
        <p className="text-xl text-center">{erro || 'Não foi possível encontrar os dados solicitados.'}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <div className="container mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{nomeCamara}</h1>
          <p className="text-2xl">
            Sessão: {sessao.titulo} - {new Date(sessao.data).toLocaleDateString('pt-BR')}
          </p>
        </header>
        
        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4 text-center">
            VOTAÇÃO EM ANDAMENTO
          </h2>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold mb-2">{projeto.titulo}</h3>
            <p className="text-xl">{projeto.numero} - {projeto.autor}</p>
            {projeto.ementa && (
              <p className="text-lg mt-4 text-gray-300">{projeto.ementa}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">VOTOS DOS VEREADORES</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vereadores.map((vereador) => (
                  <div 
                    key={vereador.id} 
                    className={`rounded-lg p-4 flex flex-col items-center ${
                      votos[vereador.id] ? getCorVoto(votos[vereador.id]) : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {vereador.foto ? (
                        <img 
                          src={vereador.foto} 
                          alt={vereador.nome} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-center">{vereador.nome}</h4>
                    <p className="text-sm mb-2">{vereador.partido}</p>
                    <div className="mt-2 font-bold text-lg">
                      {getTextoVoto(votos[vereador.id])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">RESULTADO PARCIAL</h3>
              
              {resultado && (
                <div>
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-xl font-medium text-green-400">SIM</span>
                      <span className="text-xl font-medium text-green-400">{resultado.sim}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-4">
                      <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${(resultado.sim / resultado.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-xl font-medium text-red-400">NÃO</span>
                      <span className="text-xl font-medium text-red-400">{resultado.nao}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-4">
                      <div 
                        className="bg-red-500 h-4 rounded-full" 
                        style={{ width: `${(resultado.nao / resultado.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-xl font-medium text-yellow-400">ABSTENÇÃO</span>
                      <span className="text-xl font-medium text-yellow-400">{resultado.abstencao}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-4">
                      <div 
                        className="bg-yellow-500 h-4 rounded-full" 
                        style={{ width: `${(resultado.abstencao / resultado.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-xl font-medium text-gray-400">NÃO VOTARAM</span>
                      <span className="text-xl font-medium text-gray-400">{resultado.naoVotaram}</span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-4">
                      <div 
                        className="bg-gray-500 h-4 rounded-full" 
                        style={{ width: `${(resultado.naoVotaram / resultado.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-10 text-center">
                    <p className="text-xl text-gray-300 mb-3">STATUS DA VOTAÇÃO</p>
                    {resultado.aprovado === null ? (
                      <div className="bg-gray-700 text-white py-3 px-6 rounded-md inline-block text-2xl font-bold">
                        EM ANDAMENTO
                      </div>
                    ) : resultado.aprovado ? (
                      <div className="bg-green-600 text-white py-3 px-6 rounded-md inline-block text-2xl font-bold">
                        APROVADO
                      </div>
                    ) : (
                      <div className="bg-red-600 text-white py-3 px-6 rounded-md inline-block text-2xl font-bold">
                        REJEITADO
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 