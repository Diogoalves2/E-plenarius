interface ConfirmarExclusaoProps {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmarExclusao({ titulo, mensagem, onConfirmar, onCancelar }: ConfirmarExclusaoProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{titulo}</h2>
        <p className="text-gray-600 mb-6">{mensagem}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancelar}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
} 