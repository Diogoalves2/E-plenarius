import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addProjeto } from '../../../services/projetos';
import { getCamaraById } from '../../../services/camaras';
import { getSessoesByCamaraId, Sessao } from '../../../services/sessoes';

export function AdicionarProjeto() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const navigate = useNavigate();
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  
  const [formData, setFormData] = useState({
    numero: '',
    titulo: '',
    descricao: '',
    tipo: 'lei',
    autor: '',
    dataApresentacao: '',
    situacao: 'tramitacao',
    sessaoIds: [] as string[],
    anexos: [] as string[]
  });

  useEffect(() => {
    if (camaraId) {
      carregarDados();
    }
  }, [camaraId]);

  const carregarDados = () => {
    if (!camaraId) return;
    
    // Carregar dados da câmara
    const camara = getCamaraById(camaraId);
    if (camara) {
      setNomeCamara(camara.nome);
      setCamaraNotFound(false);
      
      // Carregar sessões disponíveis
      const sessoesData = getSessoesByCamaraId(camaraId);
      // Filtrar apenas sessões agendadas ou em tramitação
      const sessoesDisponiveis = sessoesData.filter(
        sessao => sessao.status === 'agendada' || sessao.status === 'realizada'
      );
      setSessoes(sessoesDisponiveis);
    } else {
      setErro('Câmara não encontrada');
      setCamaraNotFound(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSessaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      sessaoIds: selectedValues
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filePromises: Promise<string>[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        filePromises.push(fileToBase64(file));
      }
      
      Promise.all(filePromises)
        .then(base64Files => {
          setFormData(prev => ({
            ...prev,
            anexos: [...prev.anexos, ...base64Files]
          }));
        })
        .catch(error => {
          console.error('Erro ao converter arquivos:', error);
          setErro('Não foi possível processar os arquivos anexados.');
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.numero || !formData.titulo || !formData.autor || !formData.dataApresentacao) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      // Criar objeto do projeto
      const novoProjeto = {
        camaraId: camaraId!,
        numero: formData.numero,
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: formData.tipo as 'lei' | 'resolucao' | 'decreto' | 'emenda' | 'outro',
        autor: formData.autor,
        dataApresentacao: new Date(formData.dataApresentacao),
        situacao: formData.situacao as 'tramitacao' | 'aprovado' | 'rejeitado' | 'arquivado',
        sessaoIds: formData.sessaoIds,
        anexos: formData.anexos
      };

      // Adicionar projeto
      await addProjeto(novoProjeto);
      
      // Redirecionar para a lista de projetos
      navigate(`/camara/${camaraId}/projetos`);
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      setErro('Não foi possível adicionar o projeto. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/camara/${camaraId}/projetos`);
  };

  const removerAnexo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }));
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark-500 font-title">Adicionar Novo Projeto - {nomeCamara}</h1>
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número do Projeto */}
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Número <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: 001/2023"
                required
              />
            </div>

            {/* Tipo de Projeto */}
            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Tipo <span className="text-error-500">*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="lei">Projeto de Lei</option>
                <option value="resolucao">Projeto de Resolução</option>
                <option value="decreto">Projeto de Decreto</option>
                <option value="emenda">Emenda</option>
                <option value="outro">Outro</option>
              </select>
            </div>

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
                placeholder="Ex: Projeto de Lei para Revitalização do Centro Histórico"
                required
              />
            </div>

            {/* Autor */}
            <div>
              <label htmlFor="autor" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Autor <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="autor"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Vereador João Silva"
                required
              />
            </div>

            {/* Data de Apresentação */}
            <div>
              <label htmlFor="dataApresentacao" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Data de Apresentação <span className="text-error-500">*</span>
              </label>
              <input
                type="date"
                id="dataApresentacao"
                name="dataApresentacao"
                value={formData.dataApresentacao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Situação */}
            <div>
              <label htmlFor="situacao" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Situação <span className="text-error-500">*</span>
              </label>
              <select
                id="situacao"
                name="situacao"
                value={formData.situacao}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="tramitacao">Em Tramitação</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            {/* Sessões */}
            <div className="col-span-2">
              <label htmlFor="sessaoIds" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Vincular a Sessões (opcional)
              </label>
              <select
                id="sessaoIds"
                name="sessaoIds"
                multiple
                value={formData.sessaoIds}
                onChange={handleSessaoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                size={Math.min(5, sessoes.length || 1)}
              >
                {sessoes.length === 0 ? (
                  <option value="" disabled>Nenhuma sessão disponível</option>
                ) : (
                  sessoes.map(sessao => (
                    <option key={sessao.id} value={sessao.id}>
                      {sessao.titulo} - {new Date(sessao.data).toLocaleDateString('pt-BR')}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Segure Ctrl (ou Cmd no Mac) para selecionar múltiplas sessões
              </p>
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
                placeholder="Descreva o projeto..."
              />
            </div>

            {/* Anexos */}
            <div className="col-span-2">
              <label htmlFor="anexos" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Anexos (opcional)
              </label>
              <input
                type="file"
                id="anexos"
                name="anexos"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG. Tamanho máximo: 5MB por arquivo
              </p>
            </div>

            {/* Lista de anexos */}
            {formData.anexos.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-medium text-dark-500 mb-2">Anexos adicionados:</h3>
                <ul className="space-y-2">
                  {formData.anexos.map((anexo, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm text-gray-700 truncate">Anexo {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removerAnexo(index)}
                        className="text-error-500 hover:text-error-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 