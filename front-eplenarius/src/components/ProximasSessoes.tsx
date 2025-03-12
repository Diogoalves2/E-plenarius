import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sessao, getProximasSessoes } from '../services/sessoes';

interface ProximasSessoesProps {
  camaraId: string;
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export function ProximasSessoes({ camaraId, limit = 3, showTitle = true, className = '' }: ProximasSessoesProps) {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (camaraId) {
      carregarSessoes();
    }
  }, [camaraId]);

  const carregarSessoes = () => {
    try {
      setLoading(true);
      
      const proximas = getProximasSessoes(camaraId);
      setSessoes(proximas.slice(0, limit));
      
      setErro(null);
    } catch (error) {
      console.error('Erro ao carregar próximas sessões:', error);
      setErro('Não foi possível carregar as próximas sessões.');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-6 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={`bg-error-100 text-error-700 p-3 rounded-md ${className}`}>
        {erro}
      </div>
    );
  }

  if (sessoes.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {showTitle && (
          <h2 className="text-lg font-semibold text-dark-500 mb-4 font-title">Próximas Sessões</h2>
        )}
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-2">Nenhuma sessão agendada</p>
          <Link 
            to={`/camara/${camaraId}/sessoes/adicionar`}
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            Agendar uma sessão
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-dark-500 font-title">Próximas Sessões</h2>
          <Link 
            to={`/camara/${camaraId}/sessoes`}
            className="text-primary-500 hover:text-primary-700 text-sm font-medium"
          >
            Ver todas →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {sessoes.map((sessao) => (
          <div key={sessao.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
            <Link 
              to={`/camara/${camaraId}/sessoes/${sessao.id}`}
              className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors"
            >
              <h3 className="font-medium text-dark-500 mb-1">{sessao.titulo}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatarData(sessao.data)}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {sessao.horaInicio} - {sessao.horaFim}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {sessao.local}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {getTipoSessao(sessao.tipo)}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 