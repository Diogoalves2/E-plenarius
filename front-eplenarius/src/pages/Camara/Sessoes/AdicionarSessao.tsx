import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addSessao } from '../../../services/sessoes';
import { getCamaraById } from '../../../services/camaras';

export function AdicionarSessao() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const navigate = useNavigate();
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'ordinaria',
    data: '',
    horaInicio: '',
    horaFim: '',
    local: '',
    descricao: '',
    status: 'agendada',
    projetosIds: [] as string[],
    ata: null as File | null
  });

  useEffect(() => {
    if (camaraId) {
      carregarNomeCamara();
    }
  }, [camaraId]);

  const carregarNomeCamara = () => {
    if (!camaraId) return;
    
    const camara = getCamaraById(camaraId);
    if (camara) {
      setNomeCamara(camara.nome);
      setCamaraNotFound(false);
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
      setLoading(true);
      setErro(null);

      // Converter arquivo para base64 se existir
      let ataBase64 = null;
      if (formData.ata) {
        ataBase64 = await fileToBase64(formData.ata);
      }

      // Criar objeto da sessão
      const novaSessao = {
        camaraId: camaraId!,
        titulo: formData.titulo,
        tipo: formData.tipo,
        data: new Date(formData.data),
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim,
        local: formData.local,
        descricao: formData.descricao,
        status: formData.status,
        projetosIds: formData.projetosIds,
        ata: ataBase64
      };

      // Adicionar sessão
      await addSessao(novaSessao);
      
      // Redirecionar para a lista de sessões
      navigate(`/camara/${camaraId}/sessoes`);
    } catch (error) {
      console.error('Erro ao adicionar sessão:', error);
      setErro('Não foi possível adicionar a sessão. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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

  const handleCancel = () => {
    navigate(`/camara/${camaraId}/sessoes`);
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
        <h1 className="text-2xl font-bold text-dark-500 font-title">Agendar Nova Sessão - {nomeCamara}</h1>
      </div>

      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
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
                placeholder="Ex: Sessão Ordinária nº 123/2023"
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
                placeholder="Ex: Plenário da Câmara Municipal"
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
                placeholder="Descreva a pauta e outros detalhes da sessão..."
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
                Formatos aceitos: PDF, DOC, DOCX. Tamanho máximo: 5MB
              </p>
            </div>
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