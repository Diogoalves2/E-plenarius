import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSessaoById, deleteSessao, updateSessao, Sessao } from '../../../services/sessoes';
import { getCamaraById } from '../../../services/camaras';
import { getProjetosBySessaoId, Projeto } from '../../../services/projetos';

export function DetalhesSessao() {
  const { camaraId, sessaoId } = useParams<{ camaraId: string, sessaoId: string }>();
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    data: '',
    horaInicio: '',
    horaFim: '',
    local: '',
    descricao: '',
    status: '',
    ata: null as File | null
  });

  useEffect(() => {
    if (camaraId && sessaoId) {
      carregarSessao();
      carregarNomeCamara();
    }
  }, [camaraId, sessaoId]);

  const carregarSessao = () => {
    try {
      setLoading(true);
      if (!sessaoId) return;
      
      const sessaoData = getSessaoById(sessaoId);
      if (sessaoData) {
        setSessao(sessaoData);
        
        // Formatar data para o formato esperado pelo input date
        const dataFormatada = new Date(sessaoData.data).toISOString().split('T')[0];
        
        setFormData({
          titulo: sessaoData.titulo,
          tipo: sessaoData.tipo,
          data: dataFormatada,
          horaInicio: sessaoData.horaInicio,
          horaFim: sessaoData.horaFim,
          local: sessaoData.local,
          descricao: sessaoData.descricao || '',
          status: sessaoData.status,
          ata: null
        });
        
        setErro(null);
        setNotFound(false);

        // Carregar projetos vinculados à sessão
        const projetosData = getProjetosBySessaoId(sessaoId);
        setProjetos(projetosData);
      } else {
        setErro('Sessão não encontrada');
        setNotFound(true);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      setErro('Não foi possível carregar os dados da sessão. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const carregarNomeCamara = () => {
    if (!camaraId) return;
    
    const camara = getCamaraById(camaraId);
    if (camara) {
      setNomeCamara(camara.nome);
    }
  };

  const handleExcluir = async () => {
    try {
      setExcluindo(true);
      if (!sessaoId) return;
      
      await deleteSessao(sessaoId);
      navigate(`/camara/${camaraId}/sessoes`);
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      setErro('Não foi possível excluir a sessão. Tente novamente mais tarde.');
      setConfirmandoExclusao(false);
    } finally {
      setExcluindo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        ata: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.titulo || !formData.data || !formData.horaInicio || !formData.horaFim || !formData.local) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      if (!sessao || !sessaoId) return;

      // Converter arquivo para base64 se existir
      let ataBase64 = sessao.ata;
      if (formData.ata) {
        ataBase64 = await fileToBase64(formData.ata);
      }

      // Criar objeto da sessão atualizada
      const sessaoAtualizada = {
        ...sessao,
        titulo: formData.titulo,
        tipo: formData.tipo,
        data: new Date(formData.data),
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim,
        local: formData.local,
        descricao: formData.descricao,
        status: formData.status,
        ata: ataBase64
      };

      // Atualizar sessão
      await updateSessao(sessaoAtualizada);
      
      // Atualizar estado local
      setSessao(sessaoAtualizada);
      setEditando(false);
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      setErro('Não foi possível atualizar a sessão. Tente novamente mais tarde.');
    } finally {
      setSalvando(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTipoSessao = (tipo: string) => {
    switch (tipo) {
      case 'ordinaria':
        return 'Ordinária';
      case 'extraordinaria':
        return 'Extraordinária';
      case 'solene':
        return 'Solene';
      default:
        return tipo;
    }
  };

  const getStatusSessao = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'realizada':
        return 'Realizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-primary-100 text-primary-800';
      case 'realizada':
        return 'bg-success-100 text-success-800';
      case 'cancelada':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoProjeto = (tipo: string) => {
    switch (tipo) {
      case 'lei':
        return 'Projeto de Lei';
      case 'resolucao':
        return 'Projeto de Resolução';
      case 'decreto':
        return 'Projeto de Decreto';
      case 'emenda':
        return 'Emenda';
      case 'outro':
        return 'Outro';
      default:
        return tipo;
    }
  };

  const getSituacaoProjeto = (situacao: string) => {
    switch (situacao) {
      case 'tramitacao':
        return 'Em Tramitação';
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      case 'arquivado':
        return 'Arquivado';
      default:
        return situacao;
    }
  };

  const getSituacaoProjetoColor = (situacao: string) => {
    switch (situacao) {
      case 'tramitacao':
        return 'bg-primary-100 text-primary-800';
      case 'aprovado':
        return 'bg-success-100 text-success-800';
      case 'rejeitado':
        return 'bg-error-100 text-error-800';
      case 'arquivado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (notFound) {
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
            to={`/camara/${camaraId}/sessoes`}
            className="text-primary-500 hover:text-primary-700 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Voltar para lista de sessões
          </Link>
          <h1 className="text-2xl font-bold text-dark-500 font-title">
            {editando ? 'Editar Sessão' : 'Detalhes da Sessão'} - {nomeCamara}
          </h1>
        </div>
        {!editando && (
          <div className="flex gap-2">
            <Link 
              to={`/camara/${camaraId}/sessoes/${sessaoId}/presenca`}
              className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Lista de Presença
            </Link>
            <a 
              href={`/tv/camara/${camaraId}/sessoes/${sessaoId}/presenca`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Painel de Presença
            </a>
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
        )}
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {editando ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="col-span-2">
                <label htmlFor="titulo" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Título <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Tipo de Sessão */}
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Tipo de Sessão <span className="text-error-500">*</span>
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="ordinaria">Ordinária</option>
                  <option value="extraordinaria">Extraordinária</option>
                  <option value="solene">Solene</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Status <span className="text-error-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Data */}
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Data <span className="text-error-500">*</span>
                </label>
                <input
                  type="date"
                  id="data"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Hora de Início */}
              <div>
                <label htmlFor="horaInicio" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Hora de Início <span className="text-error-500">*</span>
                </label>
                <input
                  type="time"
                  id="horaInicio"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Hora de Término */}
              <div>
                <label htmlFor="horaFim" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Hora de Término <span className="text-error-500">*</span>
                </label>
                <input
                  type="time"
                  id="horaFim"
                  name="horaFim"
                  value={formData.horaFim}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Local */}
              <div className="col-span-2">
                <label htmlFor="local" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Local <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  id="local"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="col-span-2">
                <label htmlFor="descricao" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Ata (opcional) */}
              <div className="col-span-2">
                <label htmlFor="ata" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                  Ata (opcional)
                </label>
                <input
                  type="file"
                  id="ata"
                  name="ata"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  accept=".pdf,.doc,.docx"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {sessao?.ata ? 'Já existe uma ata anexada. Envie um novo arquivo para substituí-la.' : 'Formatos aceitos: PDF, DOC, DOCX. Tamanho máximo: 5MB'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        ) : sessao ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sessao.status)} mb-2`}>
                {getStatusSessao(sessao.status)}
              </span>
              <h2 className="text-xl font-semibold text-dark-500 font-title">{sessao.titulo}</h2>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo de Sessão</h3>
              <p className="text-dark-500">{getTipoSessao(sessao.tipo)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Data</h3>
              <p className="text-dark-500">{formatarData(sessao.data)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Horário</h3>
              <p className="text-dark-500">{sessao.horaInicio} - {sessao.horaFim}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Local</h3>
              <p className="text-dark-500">{sessao.local}</p>
            </div>
            
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Descrição</h3>
              <p className="text-dark-500 whitespace-pre-line">{sessao.descricao || 'Nenhuma descrição fornecida.'}</p>
            </div>
            
            {sessao.ata && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Ata</h3>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <a 
                    href={sessao.ata} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-700 underline"
                  >
                    Visualizar Ata
                  </a>
                </div>
              </div>
            )}
            
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Data de Criação</h3>
              <p className="text-dark-500">{formatarData(sessao.dataCriacao)}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Projetos Vinculados */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dark-500 font-title">Projetos Vinculados</h2>
          <Link 
            to={`/camara/${camaraId}/projetos/adicionar`}
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            Adicionar Projeto
          </Link>
        </div>
        
        {projetos.length === 0 ? (
          <p className="text-gray-500">Nenhum projeto vinculado a esta sessão.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Situação
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projetos.map((projeto) => (
                  <tr key={projeto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-dark-500">{projeto.numero}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{projeto.titulo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTipoProjeto(projeto.tipo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{projeto.autor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSituacaoProjetoColor(projeto.situacao)}`}>
                        {getSituacaoProjeto(projeto.situacao)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/camara/${camaraId}/projetos/${projeto.id}`}
                          className="text-secondary-500 hover:text-secondary-700"
                        >
                          Ver detalhes
                        </Link>
                        <Link 
                          to={`/camara/${camaraId}/sessoes/${sessaoId}/projetos/${projeto.id}/votacao`}
                          className="text-primary-500 hover:text-primary-700"
                        >
                          Iniciar Votação
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          to={`/camara/${camaraId}/sessoes/${sessao.id}/presenca`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Registrar Presenças
        </Link>
        <Link
          to={`/camara/${camaraId}/sessoes/${sessao.id}/tempo`}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Painel de Tempo
        </Link>
        <button
          onClick={() => setEditando(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar Sessão
        </button>
        <button
          onClick={handleExcluir}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Excluir Sessão
        </button>
      </div>
    </div>
  );
}