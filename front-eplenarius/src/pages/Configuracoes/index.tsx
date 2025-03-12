import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getConfiguracoes, 
  saveConfiguracoes, 
  ConfiguracoesType,
  temasPadrao
} from '../../services/configuracoes';

export function Configuracoes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesType>({
    tema: 'padrao',
    corPrimaria: '#1E40AF',
    corSecundaria: '#047857',
    mostrarLogo: true,
    tamanhoFonte: 'medio',
    modoContraste: false,
    tempoSessaoInativa: 30,
    notificacoesAtivas: true
  });
  
  useEffect(() => {
    carregarConfiguracoes();
  }, []);
  
  const carregarConfiguracoes = () => {
    try {
      setLoading(true);
      const configSalvas = getConfiguracoes();
      if (configSalvas) {
        setConfiguracoes(configSalvas);
      }
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setErro('Não foi possível carregar as configurações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfiguracoes(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setConfiguracoes(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else {
      setConfiguracoes(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSalvando(true);
      setErro(null);
      
      // Salvar configurações
      await saveConfiguracoes(configuracoes);
      
      setSucesso(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSucesso(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErro('Não foi possível salvar as configurações. Tente novamente mais tarde.');
    } finally {
      setSalvando(false);
    }
  };
  
  const aplicarTema = (tema: string) => {
    const temaSelecionado = temasPadrao.find(t => t.id === tema);
    if (temaSelecionado) {
      setConfiguracoes(prev => ({
        ...prev,
        tema,
        corPrimaria: temaSelecionado.corPrimaria,
        corSecundaria: temaSelecionado.corSecundaria
      }));
    }
  };
  
  const resetarConfiguracoes = () => {
    const configPadrao: ConfiguracoesType = {
      tema: 'padrao',
      corPrimaria: '#1E40AF',
      corSecundaria: '#047857',
      mostrarLogo: true,
      tamanhoFonte: 'medio',
      modoContraste: false,
      tempoSessaoInativa: 30,
      notificacoesAtivas: true
    };
    
    setConfiguracoes(configPadrao);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Configurações do Sistema</h1>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={resetarConfiguracoes}
            className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restaurar Padrão
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            disabled={salvando}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-4 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{erro}</span>
        </div>
      )}
      
      {sucesso && (
        <div className="bg-success-100 text-success-700 p-4 rounded-md mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Configurações salvas com sucesso!</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Aparência */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h2 className="text-lg font-semibold text-dark-500 font-title">Aparência</h2>
          </div>
          
          <div className="space-y-4">
            {/* Tema */}
            <div>
              <label htmlFor="tema" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Tema
              </label>
              <select
                id="tema"
                name="tema"
                value={configuracoes.tema}
                onChange={(e) => {
                  aplicarTema(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {temasPadrao.map(tema => (
                  <option key={tema.id} value={tema.id}>{tema.nome}</option>
                ))}
              </select>
            </div>
            
            {/* Tamanho da Fonte */}
            <div>
              <label htmlFor="tamanhoFonte" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Tamanho da Fonte
              </label>
              <select
                id="tamanhoFonte"
                name="tamanhoFonte"
                value={configuracoes.tamanhoFonte}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
            </div>
            
            {/* Cores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cor Primária */}
              <div>
                <label htmlFor="corPrimaria" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Cor Primária
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="corPrimaria"
                    name="corPrimaria"
                    value={configuracoes.corPrimaria}
                    onChange={handleChange}
                    className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={configuracoes.corPrimaria}
                    onChange={handleChange}
                    name="corPrimaria"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              {/* Cor Secundária */}
              <div>
                <label htmlFor="corSecundaria" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Cor Secundária
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    id="corSecundaria"
                    name="corSecundaria"
                    value={configuracoes.corSecundaria}
                    onChange={handleChange}
                    className="w-10 h-10 border border-gray-300 rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={configuracoes.corSecundaria}
                    onChange={handleChange}
                    name="corSecundaria"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Opções de Exibição */}
            <div className="space-y-2 pt-2">
              {/* Mostrar Logo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mostrarLogo"
                  name="mostrarLogo"
                  checked={configuracoes.mostrarLogo}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="mostrarLogo" className="ml-2 block text-sm text-gray-700 font-body">
                  Mostrar logo no cabeçalho
                </label>
              </div>
              
              {/* Modo de Alto Contraste */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="modoContraste"
                  name="modoContraste"
                  checked={configuracoes.modoContraste}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="modoContraste" className="ml-2 block text-sm text-gray-700 font-body">
                  Modo de alto contraste (acessibilidade)
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card de Segurança e Notificações */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-lg font-semibold text-dark-500 font-title">Segurança e Notificações</h2>
          </div>
          
          <div className="space-y-4">
            {/* Tempo de Sessão Inativa */}
            <div>
              <label htmlFor="tempoSessaoInativa" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Tempo de sessão inativa (minutos)
              </label>
              <input
                type="number"
                id="tempoSessaoInativa"
                name="tempoSessaoInativa"
                value={configuracoes.tempoSessaoInativa}
                onChange={handleChange}
                min="5"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo em minutos até que a sessão expire por inatividade (mínimo 5, máximo 120)
              </p>
            </div>
            
            {/* Notificações */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                id="notificacoesAtivas"
                name="notificacoesAtivas"
                checked={configuracoes.notificacoesAtivas}
                onChange={handleChange}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="notificacoesAtivas" className="ml-2 block text-sm text-gray-700 font-body">
                Ativar notificações do sistema
              </label>
            </div>
          </div>
          
          {/* Visualização de Tema */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-dark-500 mb-3 font-body">Visualização do Tema Atual</h3>
            <div className="border border-gray-200 rounded-md p-4">
              <div className="flex space-x-2 mb-2">
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{backgroundColor: configuracoes.corPrimaria}}
                  title="Cor Primária"
                ></div>
                <div 
                  className="w-8 h-8 rounded-full" 
                  style={{backgroundColor: configuracoes.corSecundaria}}
                  title="Cor Secundária"
                ></div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-primary-500 text-white px-3 py-1 rounded-md text-sm">Botão Primário</button>
                <button className="bg-secondary-500 text-white px-3 py-1 rounded-md text-sm">Botão Secundário</button>
              </div>
              <div className="mt-2">
                <p className="text-dark-500" style={{fontSize: configuracoes.tamanhoFonte === 'pequeno' ? '14px' : configuracoes.tamanhoFonte === 'grande' ? '18px' : '16px'}}>
                  Exemplo de texto com o tamanho de fonte selecionado.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card de Informações do Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-dark-500 font-title">Informações do Sistema</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Versão</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Última atualização</span>
              <span className="text-sm font-medium">01/08/2023</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Navegador</span>
              <span className="text-sm font-medium">{navigator.userAgent.split(' ').slice(-1)[0].split('/')[0]}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Resolução</span>
              <span className="text-sm font-medium">{window.innerWidth} x {window.innerHeight}</span>
            </div>
          </div>
        </div>
        
        {/* Card de Atalhos de Teclado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-dark-500 font-title">Atalhos de Teclado</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Salvar configurações</span>
              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Ctrl + S</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Restaurar padrões</span>
              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Ctrl + R</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Alternar contraste</span>
              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Ctrl + Alt + C</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">Aumentar fonte</span>
              <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">Ctrl + +</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 