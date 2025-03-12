import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCamaraById, updateCamara, Vereador as VereadorType } from '../../services/camaras';

// Interface para vereadores no formulário de edição
interface Vereador {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  foto?: string;
  fotoPreview?: string;
  isPresidente: boolean;
  isNew?: boolean;
  // Para vereadores novos
  fotoFile?: File | null;
}

export function EditarCamara() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
  });
  
  const [regimentoInterno, setRegimentoInterno] = useState<File | null>(null);
  const [regimentoInternoUrl, setRegimentoInternoUrl] = useState<string | undefined>(undefined);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | undefined>(undefined);
  
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [novoVereador, setNovoVereador] = useState({
    nome: '',
    cargo: '',
    email: '',
    fotoFile: null as File | null,
    fotoPreview: undefined as string | undefined,
    isPresidente: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (id) {
      carregarCamara(id);
    }
  }, [id]);

  const carregarCamara = (camaraId: string) => {
    try {
      setLoading(true);
      const camaraData = getCamaraById(camaraId);
      
      if (camaraData) {
        // Preencher o formulário com os dados da câmara
        setFormData({
          nome: camaraData.nome,
          cnpj: camaraData.cnpj,
          endereco: camaraData.endereco,
          cidade: camaraData.cidade,
          estado: camaraData.estado,
          cep: camaraData.cep,
          telefone: camaraData.telefone,
          email: camaraData.email,
        });
        
        // Definir URLs de arquivos existentes
        setRegimentoInternoUrl(camaraData.regimentoInterno);
        setImagemUrl(camaraData.imagem);
        
        // Carregar vereadores
        setVereadores(camaraData.vereadores.map(v => ({
          ...v,
          fotoPreview: v.foto
        })));
        
        setErro(null);
      } else {
        setErro('Câmara não encontrada');
        navigate('/camaras');
      }
    } catch (error) {
      console.error('Erro ao carregar câmara:', error);
      setErro('Não foi possível carregar os dados da câmara');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegimentoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRegimentoInterno(e.target.files[0]);
      setRegimentoInternoUrl(undefined); // Limpar URL existente
    }
  };

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVereadorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Se estiver marcando um vereador como presidente, desmarca os outros
      if (checked) {
        setVereadores(vereadores.map(v => ({
          ...v,
          isPresidente: false
        })));
      }
      
      setNovoVereador({
        ...novoVereador,
        [name]: checked,
      });
    } else {
      setNovoVereador({
        ...novoVereador,
        [name]: value,
      });
    }
  };
  
  const handleVereadorFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Criar preview da foto
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovoVereador({
          ...novoVereador,
          fotoFile: file,
          fotoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const adicionarVereador = () => {
    if (!novoVereador.nome || !novoVereador.cargo || !novoVereador.email) {
      setErro('Preencha todos os campos obrigatórios do vereador');
      return;
    }
    
    // Se estiver adicionando um presidente, desmarca os outros
    const novosVereadores = novoVereador.isPresidente 
      ? vereadores.map(v => ({ ...v, isPresidente: false }))
      : [...vereadores];
    
    setVereadores([
      ...novosVereadores,
      {
        id: `novo-${Date.now()}`,
        nome: novoVereador.nome,
        cargo: novoVereador.cargo,
        email: novoVereador.email,
        fotoPreview: novoVereador.fotoPreview,
        fotoFile: novoVereador.fotoFile,
        isPresidente: novoVereador.isPresidente,
        isNew: true
      },
    ]);
    
    // Limpar o formulário de vereador
    setNovoVereador({
      nome: '',
      cargo: '',
      email: '',
      fotoFile: null,
      fotoPreview: undefined,
      isPresidente: false,
    });
    
    setErro(null);
  };

  const removerVereador = (id: string) => {
    setVereadores(vereadores.filter(vereador => vereador.id !== id));
  };
  
  const togglePresidente = (id: string) => {
    setVereadores(vereadores.map(vereador => ({
      ...vereador,
      isPresidente: vereador.id === id ? true : false
    })));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    // Validação básica
    if (!formData.nome || !formData.cidade || !formData.estado || !formData.cnpj) {
      setErro('Preencha os campos obrigatórios');
      return;
    }
    
    // Validar se existe pelo menos um vereador presidente
    const temPresidente = vereadores.some(v => v.isPresidente);
    if (!temPresidente && vereadores.length > 0) {
      setErro('É necessário definir um vereador como presidente');
      return;
    }
    
    setSalvando(true);
    setErro(null);
    
    try {
      // Processar vereadores
      const vereadoresToSave: VereadorType[] = await Promise.all(
        vereadores.map(async v => {
          // Se for um vereador novo com foto, converter a foto para base64
          if (v.isNew && v.fotoFile) {
            const fotoBase64 = await readFileAsBase64(v.fotoFile);
            return {
              id: v.id,
              nome: v.nome,
              cargo: v.cargo,
              email: v.email,
              foto: fotoBase64,
              isPresidente: v.isPresidente
            };
          }
          
          // Se for um vereador existente, manter a foto atual
          return {
            id: v.id,
            nome: v.nome,
            cargo: v.cargo,
            email: v.email,
            foto: v.foto,
            isPresidente: v.isPresidente
          };
        })
      );
      
      // Processar arquivos
      let regimentoBase64 = regimentoInternoUrl;
      let imagemBase64 = imagemUrl;
      
      if (regimentoInterno) {
        // Verificar tamanho do arquivo antes de converter
        if (regimentoInterno.size > 1024 * 1024 * 2) { // 2MB
          setErro('O arquivo do regimento interno é muito grande. O tamanho máximo é 2MB.');
          setSalvando(false);
          return;
        }
        regimentoBase64 = await readFileAsBase64(regimentoInterno);
      }
      
      if (imagem) {
        // Verificar tamanho da imagem antes de converter
        if (imagem.size > 1024 * 1024 * 2) { // 2MB
          setErro('A imagem é muito grande. O tamanho máximo é 2MB.');
          setSalvando(false);
          return;
        }
        imagemBase64 = await readFileAsBase64(imagem);
      }
      
      // Atualizar a câmara
      try {
        await updateCamara(id, {
          ...formData,
          regimentoInterno: regimentoBase64,
          imagem: imagemBase64,
          vereadores: vereadoresToSave
        });
        
        setSucesso(true);
        
        // Redirecionar para a página de detalhes após 2 segundos
        setTimeout(() => {
          navigate(`/camaras/${id}`);
        }, 2000);
      } catch (updateError) {
        console.error('Erro ao atualizar câmara:', updateError);
        
        // Verificar se é um erro de quota
        if (updateError instanceof DOMException && updateError.name === 'QuotaExceededError') {
          setErro('Limite de armazenamento excedido. Tente reduzir o tamanho das imagens ou remover alguns vereadores.');
        } else {
          setErro('Ocorreu um erro ao salvar as alterações. Tente novamente mais tarde.');
        }
      }
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      setErro('Ocorreu um erro ao processar os dados. Verifique as imagens e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };
  
  // Função auxiliar para converter arquivo para base64 com compressão para imagens
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Se for uma imagem, usar compressão
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Criar canvas para redimensionar
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Redimensionar se for muito grande
            const maxWidth = 800;
            if (width > maxWidth) {
              height = Math.floor(height * (maxWidth / width));
              width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar imagem redimensionada
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Não foi possível obter o contexto 2D do canvas'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converter para JPEG com qualidade reduzida
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedBase64);
          };
          
          img.onerror = () => {
            reject(new Error('Erro ao carregar a imagem'));
          };
          
          img.src = event.target?.result as string;
        };
        
        reader.onerror = () => {
          reject(new Error('Erro ao ler o arquivo'));
        };
        
        reader.readAsDataURL(file);
      } else {
        // Para outros tipos de arquivo, usar o método padrão
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    });
  };
  
  const handleCancelar = () => {
    navigate(`/camaras/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link 
          to={`/camaras/${id}`} 
          className="text-secondary-500 hover:text-secondary-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-dark-500 font-title">Editar Câmara</h1>
      </div>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      {sucesso && (
        <div className="bg-success-100 text-success-700 p-3 rounded-md mb-4 text-sm">
          Câmara atualizada com sucesso! Redirecionando...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-dark-500 mb-3 font-title">Informações Básicas</h2>
          </div>
          
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Nome da Câmara <span className="text-error-500">*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              value={formData.nome}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              CNPJ <span className="text-error-500">*</span>
            </label>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder="00.000.000/0000-00"
              required
            />
          </div>
          
          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Endereço
            </label>
            <input
              id="endereco"
              name="endereco"
              type="text"
              value={formData.endereco}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Cidade <span className="text-error-500">*</span>
            </label>
            <input
              id="cidade"
              name="cidade"
              type="text"
              value={formData.cidade}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Estado <span className="text-error-500">*</span>
            </label>
            <input
              id="estado"
              name="estado"
              type="text"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cep" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              CEP
            </label>
            <input
              id="cep"
              name="cep"
              type="text"
              value={formData.cep}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Telefone
            </label>
            <input
              id="telefone"
              name="telefone"
              type="text"
              value={formData.telefone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          
          {/* Arquivos */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-dark-500 mb-3 font-title">Arquivos</h2>
          </div>
          
          <div>
            <label htmlFor="regimentoInterno" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Regimento Interno (PDF)
            </label>
            <input
              id="regimentoInterno"
              name="regimentoInterno"
              type="file"
              accept=".pdf"
              onChange={handleRegimentoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            {regimentoInterno && (
              <p className="mt-1 text-xs text-gray-500">
                Novo arquivo selecionado: {regimentoInterno.name}
              </p>
            )}
            {regimentoInternoUrl && !regimentoInterno && (
              <p className="mt-1 text-xs text-gray-500">
                Arquivo atual: Regimento Interno
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="imagem" className="block text-sm font-medium text-dark-500 mb-1 font-body">
              Imagem da Câmara
            </label>
            <input
              id="imagem"
              name="imagem"
              type="file"
              accept="image/*"
              onChange={handleImagemChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            {imagemUrl && (
              <div className="mt-2">
                <img 
                  src={imagemUrl} 
                  alt="Preview" 
                  className="h-32 w-auto object-cover rounded-md border border-gray-300" 
                />
              </div>
            )}
          </div>
          
          {/* Vereadores */}
          <div className="md:col-span-2 mt-4">
            <h2 className="text-lg font-semibold text-dark-500 mb-3 font-title">Vereadores</h2>
            <p className="text-sm text-gray-500 mb-3">
              Adicione ou edite os vereadores da câmara. O vereador marcado como presidente será o administrador da câmara.
            </p>
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="vereadorNome" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Nome <span className="text-error-500">*</span>
              </label>
              <input
                id="vereadorNome"
                name="nome"
                type="text"
                value={novoVereador.nome}
                onChange={handleVereadorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="vereadorCargo" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Cargo <span className="text-error-500">*</span>
              </label>
              <input
                id="vereadorCargo"
                name="cargo"
                type="text"
                value={novoVereador.cargo}
                onChange={handleVereadorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="vereadorEmail" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Email <span className="text-error-500">*</span>
              </label>
              <input
                id="vereadorEmail"
                name="email"
                type="email"
                value={novoVereador.email}
                onChange={handleVereadorChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="vereadorFoto" className="block text-sm font-medium text-dark-500 mb-1 font-body">
                Foto
              </label>
              <input
                id="vereadorFoto"
                name="foto"
                type="file"
                accept="image/*"
                onChange={handleVereadorFotoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            
            {novoVereador.fotoPreview && (
              <div className="md:col-span-4 flex items-center gap-4">
                <img 
                  src={novoVereador.fotoPreview} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-full border border-gray-300" 
                />
                <div className="flex-1"></div>
              </div>
            )}
            
            <div className="md:col-span-3 flex items-center">
              <input
                id="isPresidente"
                name="isPresidente"
                type="checkbox"
                checked={novoVereador.isPresidente}
                onChange={handleVereadorChange}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isPresidente" className="ml-2 block text-sm text-gray-700 font-body">
                Este vereador é o presidente da câmara (administrador)
              </label>
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={adicionarVereador}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md transition-colors"
              >
                Adicionar Vereador
              </button>
            </div>
          </div>
          
          {/* Lista de Vereadores */}
          {vereadores.length > 0 && (
            <div className="md:col-span-2 mt-2">
              <h3 className="text-sm font-medium text-dark-500 mb-2 font-body">Vereadores</h3>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Foto
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presidente
                      </th>
                      <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vereadores.map((vereador) => (
                      <tr key={vereador.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {(vereador.fotoPreview || vereador.foto) ? (
                            <img 
                              src={vereador.fotoPreview || vereador.foto} 
                              alt={vereador.nome} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">Sem foto</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {vereador.nome}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {vereador.cargo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {vereador.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          {vereador.isPresidente ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-100 text-success-800">
                              Sim
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => togglePresidente(vereador.id)}
                              className="text-xs text-primary-500 hover:text-primary-700"
                            >
                              Definir como presidente
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                          <button
                            type="button"
                            onClick={() => removerVereador(vereador.id)}
                            className="text-error-500 hover:text-error-700"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Botões de Ação */}
          <div className="md:col-span-2 mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleCancelar}
              className="bg-gray-200 hover:bg-gray-300 text-dark-500 font-medium py-2 px-4 rounded-md transition-colors mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 