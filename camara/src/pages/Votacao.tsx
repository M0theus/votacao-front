import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { votacaoService } from '../services/votacaoService';
import { useNavigate } from 'react-router-dom';
import './Votacao.css';

const Votacao: React.FC = () => {
  const [votando, setVotando] = useState(false);
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleVoto = async (voto: 'SIM' | 'NAO') => {
    try {
      setVotando(true);
      await votacaoService.votar(voto);
      alert('Voto registrado com sucesso!');
    } catch (error) {
      alert('Erro ao registrar voto');
    } finally {
      setVotando(false);
    }
  };

  const handleIrParaAdmin = () => {
    console.log('=== CLICOU PARA IR PARA ADMIN ===');
    console.log('Usuario:', usuario);
    console.log('Tipo do usuario:', usuario?.tipo);
    console.log('isAuthenticated:', isAuthenticated);
    navigate('/admin');
  };

  if (usuario?.tipo === 'ADMINISTRADOR') {
    return (
      <div className="votacao-container">
        <div className="votacao-card">
          <h2 className="votacao-title">Painel Administrativo</h2>
          <p className="votacao-subtitle">Como administrador, você pode acessar o painel de controle.</p>
          <button onClick={handleIrParaAdmin} className="admin-button">
            Ir para Painel Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="votacao-container">
      <div className="votacao-card">
        <h2 className="votacao-title">Votação</h2>
        <p className="votacao-subtitle">Escolha sua opção:</p>
        
        <div className="botoes-container">
          <button 
            onClick={() => handleVoto('SIM')} 
            disabled={votando}
            className={`btn-voto btn-sim ${votando ? 'btn-disabled' : ''}`}
          >
            <span className="btn-text">SIM</span>
          </button>
          
          <button 
            onClick={() => handleVoto('NAO')} 
            disabled={votando}
            className={`btn-voto btn-nao ${votando ? 'btn-disabled' : ''}`}
          >
            <span className="btn-text">NÃO</span>
          </button>
        </div>
        
        <div className="acoes-container">
          <button 
            onClick={() => navigate('/resultado')} 
            className="btn-resultados"
          >
            Ver Resultados
          </button>
        </div>
      </div>
    </div>
  );
};

export default Votacao;