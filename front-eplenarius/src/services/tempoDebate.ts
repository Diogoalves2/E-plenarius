// Interface para o estado do tempo de debate
export interface TempoDebate {
  sessaoId: string;
  vereadorId: string | null;
  ativo: boolean;
  tempoTotal: number; // em segundos
  tempoRestante: number; // em segundos
  iniciado: string | null; // timestamp ISO
  pausado: boolean;
  historico: TempoVereador[];
  inscricoes: Inscricao[];
  inscricoesAbertas: boolean;
}

// Interface para o histórico de tempo por vereador
export interface TempoVereador {
  vereadorId: string;
  nome: string;
  partido: string;
  foto?: string;
  tempoUtilizado: number; // em segundos
  dataInicio: string;
  dataFim: string;
}

// Interface para inscrições de vereadores
export interface Inscricao {
  vereadorId: string;
  dataInscricao: string;
  ordem: number;
  atendido: boolean;
}

// Chave para armazenar o tempo de debate no localStorage
const TEMPO_DEBATE_KEY = '@EPlenarius:tempoDebate';

// Função para obter o estado atual do tempo de debate
export const getTempoDebate = (sessaoId: string): TempoDebate | null => {
  try {
    const tempoDebateStr = localStorage.getItem(TEMPO_DEBATE_KEY);
    if (!tempoDebateStr) return null;
    
    const tempoDebate: TempoDebate = JSON.parse(tempoDebateStr);
    
    // Verificar se o tempo de debate é para a sessão atual
    if (tempoDebate.sessaoId !== sessaoId) return null;
    
    // Garantir que as propriedades existam (para compatibilidade com versões anteriores)
    if (!tempoDebate.inscricoes) {
      tempoDebate.inscricoes = [];
    }
    
    if (tempoDebate.inscricoesAbertas === undefined) {
      tempoDebate.inscricoesAbertas = false;
    }
    
    return tempoDebate;
  } catch (error) {
    console.error('Erro ao obter tempo de debate:', error);
    return null;
  }
};

// Função para iniciar um novo tempo de debate
export const iniciarTempoDebate = (
  sessaoId: string, 
  tempoTotal: number = 300 // 5 minutos por padrão
): TempoDebate => {
  const novoTempoDebate: TempoDebate = {
    sessaoId,
    vereadorId: null,
    ativo: false,
    tempoTotal,
    tempoRestante: tempoTotal,
    iniciado: null,
    pausado: false,
    historico: [],
    inscricoes: [],
    inscricoesAbertas: false
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(novoTempoDebate));
  return novoTempoDebate;
};

// Função para liberar o tempo para um vereador
export const liberarTempo = (
  sessaoId: string, 
  vereadorId: string, 
  vereadorNome: string,
  vereadorPartido: string,
  vereadorFoto?: string
): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate) return null;
  
  // Se já houver um vereador com tempo ativo, finalizar o tempo dele
  if (tempoDebate.ativo && tempoDebate.vereadorId && tempoDebate.vereadorId !== vereadorId) {
    finalizarTempo(sessaoId);
  }
  
  const agora = new Date().toISOString();
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    vereadorId,
    ativo: true,
    iniciado: agora,
    pausado: false
  };
  
  // Marcar a inscrição como atendida, se existir
  if (tempoAtualizado.inscricoes && tempoAtualizado.inscricoes.some(i => i.vereadorId === vereadorId && !i.atendido)) {
    tempoAtualizado.inscricoes = tempoAtualizado.inscricoes.map(inscricao => 
      inscricao.vereadorId === vereadorId && !inscricao.atendido
        ? { ...inscricao, atendido: true }
        : inscricao
    );
  }
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para pausar o tempo
export const pausarTempo = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate || !tempoDebate.ativo || !tempoDebate.iniciado) return null;
  
  // Calcular o tempo decorrido desde o início
  const inicio = new Date(tempoDebate.iniciado).getTime();
  const agora = new Date().getTime();
  const tempoDecorrido = Math.floor((agora - inicio) / 1000);
  
  // Atualizar o tempo restante
  const tempoRestante = Math.max(0, tempoDebate.tempoRestante - tempoDecorrido);
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    tempoRestante,
    pausado: true
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para retomar o tempo
export const retomarTempo = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate || !tempoDebate.pausado) return null;
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    iniciado: new Date().toISOString(),
    pausado: false
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para finalizar o tempo
export const finalizarTempo = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate || !tempoDebate.vereadorId) return null;
  
  let tempoUtilizado = 0;
  
  // Se o tempo estiver ativo, calcular o tempo utilizado
  if (tempoDebate.ativo && tempoDebate.iniciado) {
    const inicio = new Date(tempoDebate.iniciado).getTime();
    const agora = new Date().getTime();
    tempoUtilizado = Math.floor((agora - inicio) / 1000);
  }
  
  // Adicionar ao histórico
  const historicoItem: TempoVereador = {
    vereadorId: tempoDebate.vereadorId,
    nome: '', // Será preenchido pelo componente
    partido: '', // Será preenchido pelo componente
    foto: '', // Será preenchido pelo componente
    tempoUtilizado,
    dataInicio: tempoDebate.iniciado || new Date().toISOString(),
    dataFim: new Date().toISOString()
  };
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    vereadorId: null,
    ativo: false,
    tempoRestante: tempoDebate.tempoTotal, // Resetar o tempo
    iniciado: null,
    pausado: false,
    historico: [...tempoDebate.historico, historicoItem]
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para atualizar o tempo restante (chamada por um timer)
export const atualizarTempoRestante = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate || !tempoDebate.ativo || tempoDebate.pausado || !tempoDebate.iniciado) return tempoDebate;
  
  // Calcular o tempo decorrido desde o início
  const inicio = new Date(tempoDebate.iniciado).getTime();
  const agora = new Date().getTime();
  const tempoDecorrido = Math.floor((agora - inicio) / 1000);
  
  // Atualizar o tempo restante
  const tempoRestante = Math.max(0, tempoDebate.tempoRestante - tempoDecorrido);
  
  // Se o tempo acabou, finalizar automaticamente
  if (tempoRestante === 0) {
    return finalizarTempo(sessaoId);
  }
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    tempoRestante,
    iniciado: new Date().toISOString() // Resetar o início para o cálculo correto
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para resetar o tempo de debate
export const resetarTempoDebate = (sessaoId: string): TempoDebate => {
  return iniciarTempoDebate(sessaoId);
};

// Função para abrir inscrições
export const abrirInscricoes = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate) return null;
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    inscricoesAbertas: true
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para fechar inscrições
export const fecharInscricoes = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate) return null;
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    inscricoesAbertas: false
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para inscrever um vereador
export const inscreverVereador = (sessaoId: string, vereadorId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate || !tempoDebate.inscricoesAbertas) return null;
  
  // Verificar se o vereador já está inscrito e não atendido
  if (tempoDebate.inscricoes.some(i => i.vereadorId === vereadorId && !i.atendido)) {
    return tempoDebate; // Vereador já está inscrito
  }
  
  // Obter a próxima ordem
  const proximaOrdem = tempoDebate.inscricoes.length > 0 
    ? Math.max(...tempoDebate.inscricoes.map(i => i.ordem)) + 1 
    : 1;
  
  const novaInscricao: Inscricao = {
    vereadorId,
    dataInscricao: new Date().toISOString(),
    ordem: proximaOrdem,
    atendido: false
  };
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    inscricoes: [...tempoDebate.inscricoes, novaInscricao]
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para remover inscrição de um vereador
export const removerInscricao = (sessaoId: string, vereadorId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate) return null;
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    inscricoes: tempoDebate.inscricoes.filter(i => !(i.vereadorId === vereadorId && !i.atendido))
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
};

// Função para limpar todas as inscrições
export const limparInscricoes = (sessaoId: string): TempoDebate | null => {
  const tempoDebate = getTempoDebate(sessaoId);
  
  if (!tempoDebate) return null;
  
  const tempoAtualizado: TempoDebate = {
    ...tempoDebate,
    inscricoes: []
  };
  
  localStorage.setItem(TEMPO_DEBATE_KEY, JSON.stringify(tempoAtualizado));
  return tempoAtualizado;
}; 