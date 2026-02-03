import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // Remove 'user' daqui se não estiver usando
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // A função login deve retornar os dados do usuário
      const userData = await login(cpf, senha);
      
      // Verifica o tipo de usuário e redireciona conforme necessário
      if (userData.tipo === 'ADMINISTRADOR' || userData.tipo === 'PRESIDENTE') {
        navigate('/admin');
      } else {
        // Para usuários NORMAL ou qualquer outro tipo
        navigate('/votacao');
      }
      
    } catch (err: any) {
      setError('CPF ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  // ... restante do código permanece igual
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="login-footer">
          <Link to="/cadastro" className="login-link">
            Não tem conta? Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;