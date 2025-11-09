import * as React from 'react';
import { useState, useEffect } from 'react';
import { votacaoService } from '../services/votacaoService';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
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

  const handleMarcarAusente = async (usuarioId: number, usuarioNome: string) => {
    if (window.confirm(`Marcar ${usuarioNome} como ausente?`)) {
      try {
        await votacaoService.marcarAusente(usuarioId);
        alert(`${usuarioNome} marcado como ausente!`);
        carregarUsuarios();
      } catch (error: any) {
        console.error('Erro ao marcar como ausente:', error);
        alert('Erro ao marcar como ausente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEncerrarVotacao = async () => {
    if (window.confirm('Tem certeza que deseja ENCERRAR a votação? Esta ação não pode ser desfeita!')) {
      try {
        await votacaoService.finalizarVotacao();
        alert('Votação encerrada com sucesso!');
        navigate('/resultado');
      } catch (error: any) {
        console.error('Erro ao encerrar votacao:', error);
        alert('Erro ao encerrar votacao: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleAbrirVotacao = async () => {
    if (window.confirm('Deseja ABRIR uma nova votação?\n\nIsso irá:\n• Limpar TODOS os votos anteriores\n• Iniciar uma nova votação\n• Manter os usuários cadastrados')) {
      try {
        await votacaoService.zerarVotacao();
        alert('Nova votação aberta com sucesso!');
        window.location.reload();
      } catch (error: any) {
        console.error('Erro ao abrir votacao:', error);
        alert('Erro ao abrir votacao: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (!usuarioLogado) {
    return <div className="admin-container">Verificando autenticacao...</div>;
  }

  if (loading) {
    return <div className="admin-container">Carregando usuarios...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Painel Administrativo - Gerenciar Usuários</h1>
          <p>Bem-vindo, {usuarioLogado.nome}</p>
        </div>
        
        <div className="admin-actions">
          <button 
            onClick={handleAbrirVotacao}
            className="btn btn-success"
          >
            Abrir Votação
          </button>

          <button 
            onClick={handleEncerrarVotacao}
            className="btn btn-danger"
          >
            Encerrar Votação
          </button>

          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="btn btn-primary"
          >
            Gerenciar Usuários
          </button>

          <button 
            onClick={() => navigate('/votacao')}
            className="btn btn-secondary"
          >
            Voltar para Votação
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
        <h3>Usuários Cadastrados ({usuarios.length})</h3>
        
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
                        onClick={() => handleMarcarAusente(user.id, user.nome)}
                        className="btn btn-ausente"
                      >
                        Marcar como Ausente
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

export default AdminPanel;