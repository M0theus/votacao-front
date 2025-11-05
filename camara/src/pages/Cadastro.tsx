import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    partido: '',
    senha: '',
    tipo: 'NORMAL' as 'NORMAL' | 'ADMINISTRADOR'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verifica se usuário é ADMIN para criar outros ADMINS
      // if (formData.tipo === 'ADMIN' && usuario?.tipo !== 'ADMIN') {
      //  setError('Apenas administradores podem criar outros administradores');
      //  return;
      // }

      await authService.cadastrar(formData);
      alert('Usuário cadastrado com sucesso!');
      navigate(usuario ? '/admin' : '/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário');
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

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Cadastrar Usuário</h2>
        
        {error && <div className="error">{error}</div>}

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
          placeholder="CPF (apenas números)"
          value={formData.cpf}
          onChange={handleChange}
          required
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
          placeholder="Senha"
          value={formData.senha}
          onChange={handleChange}
          required
        />

        {usuario?.tipo === 'ADMINISTRADOR' && (
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="NORMAL">Votante</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>

        {!usuario && (
          <Link to="/login">Já tem conta? Faça login</Link>
        )}
      </form>
    </div>
  );
};

export default Cadastro;