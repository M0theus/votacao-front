import api from './api';
import type { AuthResponse, Usuario } from '../types';

export const authService = {
  async login(cpf: string, senha: string): Promise<AuthResponse> {
    console.log('Enviando requisicao de login:', { cpf, senha });
    const response = await api.post('/auth/login', { cpf, senha });
    console.log('Resposta do login:', response.data);
    return response.data;
  },

  async cadastrar(usuario: Omit<Usuario, 'id'>): Promise<Usuario> {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },

  async atualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  async listarUsuarios(): Promise<Usuario[]> {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async buscarPorId(id: number): Promise<Usuario> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async deletar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }
};