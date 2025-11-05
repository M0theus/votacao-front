import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const EditarUsuario: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    partido: '',
    senha: '',
    tipo: 'NORMAL' as 'ADMINISTRADOR' | 'NORMAL'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Carrega dados do usuário atual
  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        cpf: usuario.cpf,
        partido: usuario.partido,
        senha: '', // Senha em branco por segurança
        tipo: usuario.tipo
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Remove campos vazios para atualização parcial
      const dadosAtualizacao: any = { ...formData };
      if (!dadosAtualizacao.senha) {
        delete dadosAtualizacao.senha;
      }

      await authService.atualizar(usuario!.id, dadosAtualizacao);
      setSuccess('Usuário atualizado com sucesso!');
      
      // Se o usuário atualizou a si mesmo, faz logout para refletir mudanças
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!usuario) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Editar Meus Dados</h2>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={formData.nome}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formData.cpf}
          onChange={handleChange}
          required
          disabled // CPF não pode ser alterado
        />

        <input
          type="text"
          name="partido"
          placeholder="Partido"
          value={formData.partido}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="senha"
          placeholder="Nova senha (deixe em branco para manter atual)"
          value={formData.senha}
          onChange={handleChange}
        />

        <div style={{ margin: '10px 0', color: '#666' }}>
          <small>Tipo: {formData.tipo}</small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar Dados'}
        </button>

        <button 
          type="button" 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: '#6c757d', marginTop: '10px' }}
        >
          Voltar
        </button>
      </form>
    </div>
  );
};

export default EditarUsuario;