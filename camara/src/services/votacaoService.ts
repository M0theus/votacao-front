import api from './api';
import type { Votacao, ResultadoVotacao } from '../types';

export const votacaoService = {
  async votar(voto: 'SIM' | 'NAO' | 'ABSTENCAO'): Promise<Votacao> {
    const userData = localStorage.getItem('usuario');
    
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }
    
    const usuario = JSON.parse(userData);
    const usuarioId = usuario.id;
    
    console.log('Enviando voto:', { usuarioId, voto });
    
    const response = await api.post('/votacao/votar', { 
      usuarioId, 
      voto 
    });
    
    return response.data;
  },

  async marcarAusente(usuarioId: number): Promise<void> {
    await api.post(`/votacao/ausente/${usuarioId}`);
  },

  async obterResultado(): Promise<ResultadoVotacao> {
    console.log('🌐 Fazendo request para /votacao/resultado');
    const response = await api.get('/votacao/resultado');
    console.log('🌐 Response data:', response.data);
    
    // A API já retorna no formato correto, então retornamos diretamente
    return response.data;
  },

  async listarVotos(): Promise<Votacao[]> {
    const response = await api.get('/votacao/votos');
    return response.data;
  },

  async finalizarVotacao(): Promise<void> {
    const userData = localStorage.getItem('usuario');
  
    if (!userData) {
      throw new Error('Usuário não autenticado');
    }
    
    const usuario = JSON.parse(userData);
    const usuarioId = usuario.id;
    
    // Enviar o usuarioId no corpo da requisição
    await api.post('/votacoes/encerrar', { usuarioId });
  },

  async zerarVotacao(): Promise<void> {
    const userData = localStorage.getItem('usuario');
  
  if (!userData) {
    throw new Error('Usuário não autenticado');
  }
  
  const usuario = JSON.parse(userData);
  const usuarioId = usuario.id;
  
  await api.post('/votacoes/criar', { usuarioId });
  },
};