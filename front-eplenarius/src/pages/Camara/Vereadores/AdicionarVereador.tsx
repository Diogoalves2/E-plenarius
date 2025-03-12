import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { addVereador } from '../../../services/vereadores';
import { getCamaraById } from '../../../services/camaras';
import { fileToBase64 } from '../../../services/utils';

export function AdicionarVereador() {
  const { camaraId } = useParams<{ camaraId: string }>();
  const navigate = useNavigate();
  
  const [nomeCamara, setNomeCamara] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [camaraNotFound, setCamaraNotFound] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    partido: '',
    cargo: 'vereador' as 'presidente' | 'vice-presidente' | '1-secretario' | '2-secretario' | 'vereador',
    email: '',
    telefone: '',
    foto: null as File | null
  });
  
  useEffect(() => {
    if (camaraId) {
      carregarDadosCamara();
    }
  }, [camaraId]);
  
  const carregarDadosCamara = () => {
    try {
      setLoading(true);
      
      const camara = getCamaraById(camaraId!);
      if (!camara) {
        setErro('Câmara não encontrada');
        setCamaraNotFound(true);
        return;
      }
      
      setNomeCamara(camara.nome);
      setCamaraNotFound(false);
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar dados da câmara:', error);
      setErro('Não foi possível carregar os dados da câmara. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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
        foto: e.target.files![0]
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.partido || !formData.cargo) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    try {
      setSalvando(true);
      setErro(null);
      
      // Converter foto para base64 se existir
      let fotoBase64 = '';
      if (formData.foto) {
        fotoBase64 = await fileToBase64(formData.foto);
      }
      
      // Criar objeto do vereador
      const vereador = {
        camaraId: camaraId!,
        nome: formData.nome,
        partido: formData.partido,
        cargo: formData.cargo,
        email: formData.email,
        telefone: formData.telefone,
        foto: fotoBase64,
        biografia: '' // Campo obrigatório na interface, mas não usado na UI
      };
      
      // Adicionar vereador
      await addVereador(vereador);
      
      // Redirecionar para a lista de vereadores
      navigate(`/camara/${camaraId}/vereadores`);
    } catch (error) {
      console.error('Erro ao adicionar vereador:', error);
      setErro('Não foi possível adicionar o vereador. Tente novamente mais tarde.');
    } finally {
      setSalvando(false);
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            to={`/camara/${camaraId}/vereadores`}
            className="text-primary-500 hover:text-primary-700 flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Voltar para lista de vereadores
          </Link>
          <h1 className="text-2xl font-bold text-dark-500 font-title">
            Adicionar Vereador - {nomeCamara}
          </h1>
        </div>
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="col-span-2">
              <label htmlFor="nome" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Nome <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            
            {/* Partido */}
            <div>
              <label htmlFor="partido" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Partido <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                id="partido"
                name="partido"
                value={formData.partido}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
                placeholder="Ex: PT, PSDB, PL, etc."
              />
            </div>
            
            {/* Cargo */}
            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Cargo <span className="text-error-500">*</span>
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="presidente">Presidente</option>
                <option value="vice-presidente">Vice-Presidente</option>
                <option value="1-secretario">1º Secretário</option>
                <option value="2-secretario">2º Secretário</option>
                <option value="vereador">Vereador</option>
              </select>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            
            {/* Foto */}
            <div className="col-span-2">
              <label htmlFor="foto" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Foto
              </label>
              <input
                type="file"
                id="foto"
                name="foto"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                accept="image/*"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <Link
              to={`/camara/${camaraId}/vereadores`}
              className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 