// User types
export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  partido: string;
  senha: string;
  tipo: 'ADMINISTRADOR' | 'NORMAL';
}

export interface AuthResponse {
  id: number;
  nome: string;
  cpf: string;
  partido: string;
  tipo: string;
  token: string;
  mensagem?: string;
}

// Voting types
export interface Votacao {
  id: number;
  usuario: Usuario;
  voto: 'SIM' | 'NAO';
  dataVoto: string;
  votacaoAtiva: boolean;
}

export interface ResultadoVotacao {
  sim: number;
  nao: number;
  ausentes: number;
  totalUsuarios: number;
}

// Request/Response types
export interface LoginData {
  cpf: string;
  senha: string
}