// src/pages/GerenciarUsuarios.tsx
import * as React from 'react';
import { useState } from 'react';
import './GerenciarUsuarios.css';

interface Usuario {
  id: number;
  nome: string;
  status: 'NORMAL' | 'AUSENTE';
}

const GerenciarUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nome: 'Usuário 1', status: 'NORMAL' },
    { id: 2, nome: 'Usuário 2', status: 'NORMAL' },
    { id: 3, nome: 'Usuário 3', status: 'NORMAL' },
    { id: 4, nome: 'Usuário 4', status: 'NORMAL' },
    { id: 5, nome: 'Usuário 5', status: 'NORMAL' },
  ]);

  const toggleStatus = (id: number) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.id === id 
        ? { 
            ...usuario, 
            status: usuario.status === 'NORMAL' ? 'AUSENTE' : 'NORMAL' 
          } 
        : usuario
    ));
  };

  return (
    <div className="container">
      <header>
        <h1>Painel Administrativo - Gerenciar Usuários</h1>
        <p className="welcome-message">Bem-vindo, <span className="admin-name">adm</span></p>
      </header>
      
      <main>
        <h2 className="section-title">Usuários Cadastrados</h2>
        <div className="user-count">Total: {usuarios.length} usuários</div>
        
        <table className="users-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.nome}</td>
                <td>
                  <span className={`status-${usuario.status.toLowerCase()}`}>
                    {usuario.status}
                  </span>
                </td>
                <td>
                  <button 
                    className={`btn-mark-${usuario.status === 'NORMAL' ? 'absent' : 'normal'}`}
                    onClick={() => toggleStatus(usuario.id)}
                  >
                    {usuario.status === 'NORMAL' ? 'Marcar como Ausente' : 'Marcar como Normal'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      
      <footer className="footer-info">
        Painel Administrativo - Sistema de Gerenciamento de Usuários
      </footer>
    </div>
  );
};

export default GerenciarUsuarios;