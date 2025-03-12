import { useState, useEffect } from 'react';
import { Usuario, updateUsuario, addUsuario, getUsuarios } from '../../services/usuarios';
import { getCamaras } from '../../services/camaras';

interface EditarUsuarioProps {
  usuario: Usuario;
  onClose: () => void;
}

export function EditarUsuario({ usuario, onClose }: EditarUsuarioProps) {
  const [formData, setFormData] = useState<Omit<Usuario, 'id' | 'dataCriacao'>>({
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    camaraId: usuario.camaraId || '',
    ativo: usuario.ativo,
    senha: usuario.senha || '',
    dataAtualizacao: usuario.dataAtualizacao
  });
  
  const [camaras, setCamaras] = useState<{ id: string, nome: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [emailExistente, setEmailExistente] = useState(false);

  const isNovo = !usuario.id;
  const titulo = isNovo ? 'Adicionar Usuário' : 'Editar Usuário';

  // Carregar câmaras para o select
  useEffect(() => {
    try {
      const dadosCamaras = getCamaras();
      setCamaras(dadosCamaras.map(c => ({ id: c.id, nome: c.nome })));
    } catch (error) {
      console.error('Erro ao carregar câmaras:', error);
      setErro('Erro ao carregar câmaras. Tente novamente.');
    }
  }, []);

  // Verificar se o email já existe
  useEffect(() => {
    if (formData.email && formData.email !== usuario.email) {
      const usuarios = getUsuarios();
      const emailJaExiste = usuarios.some(u => u.email === formData.email && u.id !== usuario.id);
      setEmailExistente(emailJaExiste);
    } else {
      setEmailExistente(false);
    }
  }, [formData.email, usuario.email, usuario.id]);

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar mensagens de erro quando o usuário começa a digitar
    setErro(null);
    setSucesso(false);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailExistente) {
      setErro('Este email já está sendo usado por outro usuário.');
      return;
    }
    
    // Validação básica
    if (!formData.nome || !formData.email) {
      setErro('Nome e email são campos obrigatórios.');
      return;
    }
    
    if (isNovo && !formData.senha) {
      setErro('Senha é obrigatória para novos usuários.');
      return;
    }
    
    if (formData.tipo === 'camaraAdmin' && !formData.camaraId) {
      setErro('Selecione uma câmara para o administrador de câmara.');
      return;
    }
    
    setLoading(true);
    setErro(null);
    
    try {
      if (isNovo) {
        // Adicionar novo usuário
        addUsuario(formData);
        setSucesso(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Atualizar usuário existente
        const usuarioAtualizado = updateUsuario(usuario.id, formData);
        
        if (usuarioAtualizado) {
          setSucesso(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setErro('Erro ao atualizar usuário. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErro('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {erro && (
          <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">
            {erro}
          </div>
        )}
        
        {sucesso && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
            Usuário {isNovo ? 'adicionado' : 'atualizado'} com sucesso!
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                emailExistente ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {emailExistente && (
              <p className="text-red-500 text-xs mt-1">Este email já está sendo usado por outro usuário.</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha {!isNovo && <span className="text-gray-500 text-xs">(deixe em branco para manter a atual)</span>}
            </label>
            <div className="relative">
              <input
                type={senhaVisivel ? "text" : "password"}
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required={isNovo}
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {senhaVisivel ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuário
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="admin">Administrador</option>
              <option value="camaraAdmin">Administrador de Câmara</option>
            </select>
          </div>
          
          {formData.tipo === 'camaraAdmin' && (
            <div className="mb-4">
              <label htmlFor="camaraId" className="block text-sm font-medium text-gray-700 mb-1">
                Câmara
              </label>
              <select
                id="camaraId"
                name="camaraId"
                value={formData.camaraId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                required={formData.tipo === 'camaraAdmin'}
              >
                <option value="">Selecione uma câmara</option>
                {camaras.map(camara => (
                  <option key={camara.id} value={camara.id}>
                    {camara.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={e => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
              Usuário ativo
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || emailExistente}
              className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                loading || emailExistente
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 