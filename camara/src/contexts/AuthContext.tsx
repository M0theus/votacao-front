import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextData {
  usuario: Usuario | null;
  login: (cpf: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = async (cpf: string, senha: string) => {
    try {
      console.log('=== INICIANDO LOGIN ===');
      
      const response: AuthResponse = await authService.login(cpf, senha);
      console.log('Resposta da API:', response);
      
      const token = response.token;
      
      console.log('Token:', token);
      
      if (!response || !token) {
        console.error('Dados faltando:', { response, token });
        throw new Error('Dados invalidos da API');
      }
      
      // Converte AuthResponse para Usuario (remove token e mensagem)
      const user: Usuario = {
        id: response.id,
        nome: response.nome,
        cpf: response.cpf,
        partido: response.partido,
        senha: '', // A senha não vem na resposta por segurança
        tipo: response.tipo as 'ADMINISTRADOR' | 'NORMAL'
      };
      
      console.log('Usuario convertido:', user);
      
      console.log('Salvando no estado e localStorage...');
      setUsuario(user); // Agora é do tipo Usuario, não AuthResponse
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(user));
      
      // Verificação imediata
      console.log('Verificando salvamento:');
      console.log('Token salvo:', localStorage.getItem('token'));
      console.log('Usuario salvo:', localStorage.getItem('usuario'));
      
    } catch (error: any) {
      console.error('ERRO NO LOGIN:', error);
      throw new Error(error.response?.data?.message || 'CPF ou senha invalidos');
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  useEffect(() => {
    console.log('=== INICIALIZANDO AUTH CONTEXT ===');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');
    
    console.log('Dados no localStorage:', { token, userData });
    
    if (token && userData && userData !== 'undefined') {
      try {
        const parsedUser: Usuario = JSON.parse(userData);
        setUsuario(parsedUser);
        console.log('Usuario restaurado:', parsedUser);
      } catch (error) {
        console.error('Erro ao restaurar usuario:', error);
        localStorage.clear();
      }
    }
  }, []);

  const isAuthenticated = !!usuario;

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
});

AuthProvider.displayName = 'AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};