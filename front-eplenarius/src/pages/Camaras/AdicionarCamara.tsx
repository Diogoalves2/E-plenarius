import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCamara, Vereador as VereadorType } from '../../services/camaras';

interface Vereador {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  foto: File | null;
  fotoPreview: string | null;
  isPresidente: boolean;
}

export function AdicionarCamara() {
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
  const [imagem, setImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string | null>(null);
  
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [novoVereador, setNovoVereador] = useState({
    nome: '',
    cargo: '',
    email: '',
    foto: null as File | null,
    fotoPreview: null as string | null,
    isPresidente: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Manipuladores de eventos para os campos do formulário
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
    }
  };

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagem(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagem(reader.result as string);
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
          foto: file,
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
    if (novoVereador.isPresidente) {
      setVereadores(vereadores.map(v => ({
        ...v,
        isPresidente: false
      })));
    }
    
    setVereadores([
      ...vereadores,
      {
        id: Date.now().toString(),
        ...novoVereador,
      },
    ]);
    
    // Limpar o formulário de vereador
    setNovoVereador({
      nome: '',
      cargo: '',
      email: '',
      foto: null,
      fotoPreview: null,
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
    
    setLoading(true);
    setErro(null);
    
    try {
      // Converter os vereadores para o formato esperado pelo serviço
      const vereadoresToSave: VereadorType[] = vereadores.map(v => ({
        id: v.id,
        nome: v.nome,
        cargo: v.cargo,
        email: v.email,
        foto: v.fotoPreview || undefined,
        isPresidente: v.isPresidente
      }));
      
      // Converter os arquivos para base64 (simulando upload)
      let regimentoBase64: string | undefined = undefined;
      let imagemBase64: string | undefined = undefined;
      
      if (regimentoInterno) {
        regimentoBase64 = await readFileAsBase64(regimentoInterno);
      }
      
      if (imagem) {
        imagemBase64 = previewImagem || undefined;
      }
      
      // Salvar a câmara
      await addCamara({
        ...formData,
        regimentoInterno: regimentoBase64,
        imagem: imagemBase64,
        vereadores: vereadoresToSave
      });
      
      setSucesso(true);
      
      // Limpar o formulário após o sucesso
      setFormData({
        nome: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
      });
      setRegimentoInterno(null);
      setImagem(null);
      setPreviewImagem(null);
      setVereadores([]);
      
      // Redirecionar para a listagem após 2 segundos
      setTimeout(() => {
        navigate('/camaras');
      }, 2000);
      
    } catch (error) {
      setErro('Ocorreu um erro ao salvar a câmara');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Função auxiliar para converter arquivo para base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleCancelar = () => {
    navigate('/camaras');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark-500 mb-4 font-title">Adicionar Câmara</h1>
      
      {erro && (
        <div className="bg-error-100 text-error-700 p-3 rounded-md mb-4 text-sm">
          {erro}
        </div>
      )}
      
      {sucesso && (
        <div className="bg-success-100 text-success-700 p-3 rounded-md mb-4 text-sm">
          Câmara adicionada com sucesso! Redirecionando...
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
                Arquivo selecionado: {regimentoInterno.name}
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
            {previewImagem && (
              <div className="mt-2">
                <img 
                  src={previewImagem} 
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
              Adicione os vereadores da câmara. O vereador marcado como presidente será o administrador da câmara.
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
              <h3 className="text-sm font-medium text-dark-500 mb-2 font-body">Vereadores Adicionados</h3>
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
                          {vereador.fotoPreview ? (
                            <img 
                              src={vereador.fotoPreview} 
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
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Câmara'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 