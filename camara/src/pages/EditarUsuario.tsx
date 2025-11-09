import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import './EditarUsuario.css';

const EditarUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    partido: '',
    senha: '',
    tipo: 'NORMAL' as 'NORMAL' | 'ADMINISTRADOR'
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    if (verificarAutenticacao() && id) {
      carregarUsuario();
    }
  }, [id, navigate]);

  const carregarUsuario = async () => {
    try {
      setLoading(true);
      // Usa a função buscarPorId que já existe no authService
      const usuarioEncontrado = await authService.buscarPorId(parseInt(id!));
      
      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado);
        setFormData({
          nome: usuarioEncontrado.nome,
          cpf: usuarioEncontrado.cpf,
          partido: usuarioEncontrado.partido,
          senha: '', // Senha em branco por segurança
          tipo: usuarioEncontrado.tipo
        });
      } else {
        setError('Usuário não encontrado');
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuário:', error);
      setError('Erro ao carregar usuário: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setError('');
    setSuccess('');

    try {
      const dadosAtualizacao: any = {
        nome: formData.nome,
        cpf: formData.cpf,
        partido: formData.partido,
        tipo: formData.tipo
      };

      // Só inclui a senha se foi alterada
      if (formData.senha.trim() !== '') {
        dadosAtualizacao.senha = formData.senha;
      }

      // Usa a função atualizar que já existe no authService
      await authService.atualizar(parseInt(id!), dadosAtualizacao);
      setSuccess('Usuário atualizado com sucesso!');
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário: ' + (error.response?.data?.message || error.message));
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja EXCLUIR este usuário?\n\nEsta ação não pode ser desfeita!')) {
      try {
        setSalvando(true);
        // Usa a função deletar que já existe no authService
        await authService.deletar(parseInt(id!));
        alert('Usuário excluído com sucesso!');
        navigate('/admin/usuarios');
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário: ' + (error.response?.data?.message || error.message));
        setSalvando(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="editar-container">
        <div className="loading">Carregando usuário...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="editar-container">
        <div className="error-message">Usuário não encontrado</div>
        <button onClick={() => navigate('/admin/usuarios')} className="btn btn-secondary">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="editar-container">
      <div className="editar-card">
        <div className="editar-header">
          <h1 className="editar-title">Editar Usuário</h1>
          <button 
            onClick={() => navigate('/admin/usuarios')}
            className="btn btn-secondary"
          >
            Voltar para Lista
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="editar-form">
          <div className="input-group">
            <label className="input-label">Nome Completo</label>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className="input-field"
              disabled={salvando}
            />
          </div>

          <div className="input-group">
            <label className="input-label">CPF</label>
            <input
              type="text"
              name="cpf"
              placeholder="CPF (apenas números)"
              value={formData.cpf}
              onChange={handleChange}
              required
              className="input-field"
              disabled={salvando}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Partido</label>
            <input
              type="text"
              name="partido"
              placeholder="Partido"
              value={formData.partido}
              onChange={handleChange}
              required
              className="input-field"
              disabled={salvando}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nova Senha</label>
            <input
              type="password"
              name="senha"
              placeholder="Deixe em branco para manter a senha atual"
              value={formData.senha}
              onChange={handleChange}
              className="input-field"
              disabled={salvando}
            />
            <small className="input-help">
              Preencha apenas se deseja alterar a senha
            </small>
          </div>

          <div className="input-group">
            <label className="input-label">Tipo de Usuário</label>
            <select 
              name="tipo" 
              value={formData.tipo} 
              onChange={handleChange}
              className="select-field"
              disabled={salvando}
            >
              <option value="NORMAL">Normal</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={salvando}
              className={`btn btn-primary ${salvando ? 'btn-disabled' : ''}`}
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            <button 
              type="button"
              onClick={handleDelete}
              disabled={salvando}
              className={`btn btn-danger ${salvando ? 'btn-disabled' : ''}`}
            >
              Excluir Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUsuario;