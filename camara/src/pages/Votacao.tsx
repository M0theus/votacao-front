import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { votacaoService } from '../services/votacaoService';
import { useNavigate } from 'react-router-dom'; // IMPORTE O useNavigate

const Votacao: React.FC = () => {
  const [votando, setVotando] = useState(false);
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // USE O HOOK

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

  // FUNÇÃO PARA DEBUG - ADICIONE ESTA
  const handleIrParaAdmin = () => {
    console.log('=== CLICOU PARA IR PARA ADMIN ===');
    console.log('Usuario:', usuario);
    console.log('Tipo do usuario:', usuario?.tipo);
    console.log('isAuthenticated:', isAuthenticated);
    
    // Use navigate em vez de window.location.href
    navigate('/admin');
  };

  if (usuario?.tipo === 'ADMINISTRADOR') {
    return (
      <div>
        <h2>Painel Administrativo</h2>
        <p>Como administrador, você pode acessar o painel de controle.</p>
        {/* MUDE PARA USAR A FUNÇÃO */}
        <button onClick={handleIrParaAdmin}>
          Ir para Painel Admin
        </button>
      </div>
    );
  }

  return (
    <div className="votacao-container">
      <h2>Votação</h2>
      <p>Escolha sua opção:</p>
      
      <div className="botoes-voto">
        <button 
          onClick={() => handleVoto('SIM')} 
          disabled={votando}
          className="btn-sim"
        >
          SIM
        </button>
        <button 
          onClick={() => handleVoto('NAO')} 
          disabled={votando}
          className="btn-nao"
        >
          NÃO
        </button>
      </div>
      
      {/* TAMBÉM CORRIJA ESTE PARA USAR navigate */}
      <button onClick={() => navigate('/resultado')}>
        Ver Resultados
      </button>
    </div>
  );
};

export default Votacao;