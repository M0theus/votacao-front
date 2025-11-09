import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import './GerenciarUsuarios.css';

const GerenciarUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarAutenticacao = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('usuario');
      
      if (!token || !userData) {
        navigate('/login');
        return false;
      }

      try {
        const usuario = JSON.parse(userData);
        setUsuarioLogado(usuario);
        
        if (usuario.tipo !== 'ADMINISTRADOR') {
          alert('Acesso restrito a administradores');
          navigate('/votacao');
          return false;
        }
        
        return true;
      } catch (error) {
        navigate('/login');
        return false;
      }
    };

    if (verificarAutenticacao()) {
      carregarUsuarios();
    }
  }, [navigate]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosData = await authService.listarUsuarios();
      setUsuarios(usuariosData || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuarios:', error);
      alert('Erro ao carregar usuarios: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditarUsuario = (usuarioId: number) => {
    navigate(`/admin/editar-usuario/${usuarioId}`);
  };

  if (!usuarioLogado) {
    return <div className="gerenciar-container">Verificando autenticacao...</div>;
  }

  if (loading) {
    return <div className="gerenciar-container">Carregando usuarios...</div>;
  }

  return (
    <div className="gerenciar-container">
      <div className="gerenciar-header">
        <div className="gerenciar-title">
          <h1>Painel Administrativo - Gerenciar Usuários</h1>
          <p>Bem-vindo, {usuarioLogado.nome}</p>
        </div>
        
        <div className="gerenciar-actions">
          <button 
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Voltar para Administração
          </button>

          <button 
            onClick={carregarUsuarios}
            className="btn btn-info"
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="usuarios-section">
        <div className="section-header">
          <h3>Usuários Cadastrados</h3>
          <div className="user-count">Total: {usuarios.length} usuários</div>
        </div>
        
        {usuarios.length === 0 ? (
          <p className="sem-usuarios">Nenhum usuário cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table className="tabela-usuarios">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Partido</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id}>
                    <td className="usuario-nome">{user.nome}</td>
                    <td className="usuario-cpf">{user.cpf}</td>
                    <td className="usuario-partido">{user.partido}</td>
                    <td>
                      <span className={`badge-tipo ${user.tipo.toLowerCase()}`}>
                        {user.tipo}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEditarUsuario(user.id)}
                        className="btn btn-primary"
                      >
                        Editar Usuário
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GerenciarUsuarios;