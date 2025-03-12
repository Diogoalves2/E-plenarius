import { useState, useEffect } from 'react';
import { getUsuarios, deleteUsuario, Usuario } from '../../services/usuarios';
import { EditarUsuario } from './EditarUsuario';
import { ConfirmarExclusao } from '../../components/ConfirmarExclusao';

export function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [excluindoUsuario, setExcluindoUsuario] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null);

  // Carregar usuários
  const carregarUsuarios = () => {
    setLoading(true);
    try {
      const dadosUsuarios = getUsuarios();
      setUsuarios(dadosUsuarios);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar usuários. Tente novamente.' });
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Função para iniciar a edição de um usuário
  const handleEditar = (usuario: Usuario) => {
    setEditandoUsuario(usuario);
  };

  // Função para iniciar a exclusão de um usuário
  const handleExcluir = (usuario: Usuario) => {
    setExcluindoUsuario(usuario);
  };

  // Função para confirmar a exclusão de um usuário
  const confirmarExclusao = () => {
    if (!excluindoUsuario) return;

    try {
      const sucesso = deleteUsuario(excluindoUsuario.id);
      
      if (sucesso) {
        setMensagem({ tipo: 'sucesso', texto: 'Usuário excluído com sucesso!' });
        carregarUsuarios();
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao excluir usuário. Tente novamente.' });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir usuário. Tente novamente.' });
    } finally {
      setExcluindoUsuario(null);
    }
  };

  // Função para cancelar a exclusão
  const cancelarExclusao = () => {
    setExcluindoUsuario(null);
  };

  // Função para fechar o modal de edição
  const fecharModalEdicao = () => {
    setEditandoUsuario(null);
    carregarUsuarios();
  };

  // Função para limpar mensagens
  useEffect(() => {
    if (mensagem) {
      const timer = setTimeout(() => {
        setMensagem(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
        <button 
          onClick={() => setEditandoUsuario({ 
            id: '', 
            nome: '', 
            email: '', 
            tipo: 'admin', 
            ativo: true, 
            dataCriacao: new Date().toISOString() 
          })}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Usuário
        </button>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`p-4 mb-4 rounded-md ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {mensagem.texto}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{usuario.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.tipo === 'admin' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {usuario.tipo === 'admin' ? 'Administrador' : 'Admin Câmara'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEditar(usuario)} 
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleExcluir(usuario)} 
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição */}
      {editandoUsuario && (
        <EditarUsuario 
          usuario={editandoUsuario} 
          onClose={fecharModalEdicao} 
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {excluindoUsuario && (
        <ConfirmarExclusao
          titulo="Excluir Usuário"
          mensagem={`Tem certeza que deseja excluir o usuário "${excluindoUsuario.nome}"? Esta ação não pode ser desfeita.`}
          onConfirmar={confirmarExclusao}
          onCancelar={cancelarExclusao}
        />
      )}
    </div>
  );
} 