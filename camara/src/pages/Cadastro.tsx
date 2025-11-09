import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import './Cadastro.css';

const Cadastro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    partido: '',
    senha: ''
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
      // Todos os usuários cadastrados serão do tipo NORMAL
      await authService.cadastrar({
        ...formData,
        tipo: 'NORMAL' as 'NORMAL' | 'ADMINISTRADOR'
      });
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <h2 className="cadastro-title">Cadastrar Usuário</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="input-group">
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="cpf"
              placeholder="CPF (apenas números)"
              value={formData.cpf}
              onChange={handleChange}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              name="partido"
              placeholder="Partido"
              value={formData.partido}
              onChange={handleChange}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={formData.senha}
              onChange={handleChange}
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`cadastro-button ${loading ? 'cadastro-button-disabled' : ''}`}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          {!usuario && (
            <div className="cadastro-footer">
              <Link to="/login" className="cadastro-link">
                Já tem conta? Faça login
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;