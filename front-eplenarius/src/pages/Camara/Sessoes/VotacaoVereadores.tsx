import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSessaoById } from '../../../services/sessoes';
import { getProjetoById } from '../../../services/projetos';
import { getVereadoresByCamaraId } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { 
  registrarVoto, 
  getVotosBySessaoAndProjeto, 
  calcularResultadoVotacao, 
  limparVotosProjeto,
  TipoVoto,
  ResultadoVotacao
} from '../../../services/votacao';

export function VotacaoVereadores() {
  const { camaraId, sessaoId, projetoId } = useParams<{ camaraId: string; sessaoId: string; projetoId: string }>();
  const navigate = useNavigate();
  
  const [nomeCamara, setNomeCamara] = useState('');
  const [sessao, setSessao] = useState<any | null>(null);
  const [projeto, setProjeto] = useState<any | null>(null);
  const [vereadores, setVereadores] = useState<any[]>([]);
  const [votos, setVotos] = useState<Record<string, TipoVoto>>({});
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);
  
  useEffect(() => {
    if (camaraId && sessaoId && projetoId) {
      carregarDados();
    }
  }, [camaraId, sessaoId, projetoId]);
  
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
        vereadoresData.length
      );
      setResultado(resultadoAtual);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVoto = async (vereadorId: string, tipoVoto: TipoVoto) => {
    try {
      setSalvando(true);
      setErro(null);
      setMensagemSucesso(null);
      
      // Registrar voto
      await registrarVoto(sessaoId!, projetoId!, vereadorId, tipoVoto);
      
      // Atualizar estado local
      setVotos(prev => ({
        ...prev,
        [vereadorId]: tipoVoto
      }));
      
      // Recalcular resultado
      const novoResultado = calcularResultadoVotacao(
        sessaoId!, 
        projetoId!, 
        vereadores.length
      );
      setResultado(novoResultado);
      
      setMensagemSucesso('Voto registrado com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao registrar voto:', error);
      setErro('Não foi possível registrar o voto. Tente novamente mais tarde.');
    } finally {
      setSalvando(false);
    }
  };
  
  const handleLimparVotos = async () => {
    try {
      setLimpando(true);
      setErro(null);
      
      // Limpar todos os votos do projeto
      await limparVotosProjeto(sessaoId!, projetoId!);
      
      // Atualizar estado local
      setVotos({});
      
      // Recalcular resultado
      const novoResultado = calcularResultadoVotacao(
        sessaoId!, 
        projetoId!, 
        vereadores.length
      );
      setResultado(novoResultado);
      
      setConfirmandoLimpar(false);
      setMensagemSucesso('Todos os votos foram limpos com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao limpar votos:', error);
      setErro('Não foi possível limpar os votos. Tente novamente mais tarde.');
    } finally {
      setLimpando(false);
    }
  };
  
  const getCorVoto = (tipoVoto: TipoVoto) => {
    switch (tipoVoto) {
      case 'favoravel':
        return 'bg-success-100 text-success-700 border-success-300';
      case 'contrario':
        return 'bg-error-100 text-error-700 border-error-300';
      case 'abstencao':
        return 'bg-warning-100 text-warning-700 border-warning-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };
  
  const getTextoVoto = (tipoVoto: TipoVoto) => {
    switch (tipoVoto) {
      case 'favoravel':
        return 'Sim';
      case 'contrario':
        return 'Não';
      case 'abstencao':
        return 'Abstenção';
      default:
        return 'Não votou';
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
  
  if (!sessao || !projeto) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-error-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-dark-500 mb-2 font-title">Dados não encontrados</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar os dados solicitados.</p>
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
          <h1 className="text-2xl font-bold text-dark-500 font-title">
            Votação de Projeto - {nomeCamara}
          </h1>
          <p className="text-gray-600">
            Sessão: {sessao.titulo} - {new Date(sessao.data).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/tv/camara/${camaraId}/sessoes/${sessaoId}/projetos/${projetoId}/votacao`}
            target="_blank"
            className="bg-success-500 hover:bg-success-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Exibir em TV
          </Link>
          <button
            onClick={() => setConfirmandoLimpar(true)}
            className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpar Votos
          </button>
        </div>
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="bg-success-100 text-success-700 p-3 rounded-md mb-4 text-sm">
          {mensagemSucesso}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-dark-500 mb-4 font-title">
          {projeto.titulo}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Número</p>
            <p className="text-dark-500">{projeto.numero}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Autor</p>
            <p className="text-dark-500">{projeto.autor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tipo</p>
            <p className="text-dark-500">{projeto.tipo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Data de Apresentação</p>
            <p className="text-dark-500">{new Date(projeto.dataApresentacao).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        
        {projeto.ementa && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 font-medium mb-1">Ementa</p>
            <p className="text-dark-500">{projeto.ementa}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-dark-500 mb-4 font-title">
              Registro de Votos
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vereador
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partido
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Voto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vereadores.map((vereador) => (
                    <tr key={vereador.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {vereador.foto ? (
                            <img 
                              src={vereador.foto} 
                              alt={vereador.nome} 
                              className="w-8 h-8 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {vereador.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getCargo(vereador.cargo)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vereador.partido}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getCorVoto(votos[vereador.id])}`}>
                          {getTextoVoto(votos[vereador.id])}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoto(vereador.id, 'favoravel')}
                            disabled={salvando}
                            className={`px-3 py-1 rounded-md ${
                              votos[vereador.id] === 'favoravel' 
                                ? 'bg-success-500 text-white' 
                                : 'bg-success-100 text-success-700 hover:bg-success-200'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => handleVoto(vereador.id, 'contrario')}
                            disabled={salvando}
                            className={`px-3 py-1 rounded-md ${
                              votos[vereador.id] === 'contrario' 
                                ? 'bg-error-500 text-white' 
                                : 'bg-error-100 text-error-700 hover:bg-error-200'
                            }`}
                          >
                            Não
                          </button>
                          <button
                            onClick={() => handleVoto(vereador.id, 'abstencao')}
                            disabled={salvando}
                            className={`px-3 py-1 rounded-md ${
                              votos[vereador.id] === 'abstencao' 
                                ? 'bg-warning-500 text-white' 
                                : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                            }`}
                          >
                            Abster
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-dark-500 mb-4 font-title">
              Resultado Parcial
            </h2>
            
            {resultado && (
              <div>
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-success-700">Sim</span>
                    <span className="text-sm font-medium text-success-700">{resultado.sim}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-success-500 h-2.5 rounded-full" 
                      style={{ width: `${(resultado.sim / resultado.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-error-700">Não</span>
                    <span className="text-sm font-medium text-error-700">{resultado.nao}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-error-500 h-2.5 rounded-full" 
                      style={{ width: `${(resultado.nao / resultado.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-warning-700">Abstenção</span>
                    <span className="text-sm font-medium text-warning-700">{resultado.abstencao}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-warning-500 h-2.5 rounded-full" 
                      style={{ width: `${(resultado.abstencao / resultado.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Não votaram</span>
                    <span className="text-sm font-medium text-gray-700">{resultado.naoVotaram}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gray-500 h-2.5 rounded-full" 
                      style={{ width: `${(resultado.naoVotaram / resultado.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">Status da votação</p>
                  {resultado.aprovado === null ? (
                    <div className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md inline-block">
                      Votação em andamento
                    </div>
                  ) : resultado.aprovado ? (
                    <div className="bg-success-100 text-success-700 py-2 px-4 rounded-md inline-block">
                      Projeto Aprovado
                    </div>
                  ) : (
                    <div className="bg-error-100 text-error-700 py-2 px-4 rounded-md inline-block">
                      Projeto Rejeitado
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de confirmação para limpar votos */}
      {confirmandoLimpar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-dark-500 mb-4 font-title">Confirmar limpeza de votos</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja limpar todos os votos deste projeto? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmandoLimpar(false)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={limpando}
              >
                Cancelar
              </button>
              <button
                onClick={handleLimparVotos}
                className="bg-error-500 hover:bg-error-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={limpando}
              >
                {limpando ? 'Limpando...' : 'Limpar Votos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 