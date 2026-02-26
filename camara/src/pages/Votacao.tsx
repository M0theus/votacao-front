import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { votacaoService } from '../services/votacaoService';
import { useNavigate } from 'react-router-dom';
import './Votacao.css';

const Votacao: React.FC = () => {
  const [votando, setVotando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [votoSelecionado, setVotoSelecionado] = useState<'SIM' | 'NAO' | 'ABSTENCAO' | null>(null);
  const [erroVotacao, setErroVotacao] = useState<{titulo: string; mensagem: string} | null>(null);
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const abrirModalConfirmacao = (voto: 'SIM' | 'NAO' | 'ABSTENCAO') => {
    setVotoSelecionado(voto);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setVotoSelecionado(null);
  };

  const fecharErro = () => {
    setErroVotacao(null);
  };

  const confirmarVoto = async () => {
    if (!votoSelecionado) return;
    
    try {
      setVotando(true);
      setModalAberto(false);
      setErroVotacao(null);
      
      await votacaoService.votar(votoSelecionado);
      
      // Mostrar mensagem de sucesso
      const mensagemSucesso = document.createElement('div');
      mensagemSucesso.className = 'toast-sucesso';
      mensagemSucesso.textContent = '✓ Voto registrado com sucesso!';
      document.body.appendChild(mensagemSucesso);
      
      setTimeout(() => {
        mensagemSucesso.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        mensagemSucesso.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(mensagemSucesso);
        }, 300);
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      
      // Verifica o tipo de erro
      if (error.response?.status === 500) {
        setErroVotacao({
          titulo: 'Nenhuma votação aberta',
          mensagem: 'Não há nenhuma votação aberta no momento. Aguarde o presidente abrir uma nova votação.'
        });
      } else if (error.response?.status === 400) {
        setErroVotacao({
          titulo: 'Erro na votação',
          mensagem: error.response?.data?.mensagem || 'Não foi possível registrar seu voto. Verifique se você já votou.'
        });
      } else if (error.response?.status === 401) {
        setErroVotacao({
          titulo: 'Sessão expirada',
          mensagem: 'Sua sessão expirou. Por favor, faça login novamente.'
        });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErroVotacao({
          titulo: 'Erro inesperado',
          mensagem: 'Ocorreu um erro ao registrar seu voto. Tente novamente mais tarde.'
        });
      }
    } finally {
      setVotando(false);
      setVotoSelecionado(null);
    }
  };

  const handleIrParaAdmin = () => {
    console.log('=== CLICOU PARA IR PARA ADMIN ===');
    console.log('Usuario:', usuario);
    console.log('Tipo do usuario:', usuario?.tipo);
    console.log('isAuthenticated:', isAuthenticated);
    navigate('/admin');
  };

  // Função para obter o texto do voto em português
  const getTextoVoto = (voto: 'SIM' | 'NAO' | 'ABSTENCAO' | null): string => {
    switch(voto) {
      case 'SIM': return 'SIM';
      case 'NAO': return 'NÃO';
      case 'ABSTENCAO': return 'ABSTENÇÃO';
      default: return '';
    }
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
        
        {/* Componente de erro simplificado */}
        {erroVotacao && (
          <div className="erro-simples-overlay">
            <div className="erro-simples-card">
              <div className="erro-simples-header">
                <span className="erro-simples-titulo">{erroVotacao.titulo}</span>
              </div>
              <div className="erro-simples-corpo">
                <p className="erro-simples-mensagem">{erroVotacao.mensagem}</p>
              </div>
              <div className="erro-simples-footer">
                <button className="erro-simples-btn" onClick={fecharErro}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="botoes-container">
          <button 
            onClick={() => abrirModalConfirmacao('SIM')} 
            disabled={votando}
            className={`btn-voto btn-sim ${votando ? 'btn-disabled' : ''}`}
          >
            <span className="btn-text">SIM</span>
          </button>
          
          <button 
            onClick={() => abrirModalConfirmacao('NAO')} 
            disabled={votando}
            className={`btn-voto btn-nao ${votando ? 'btn-disabled' : ''}`}
          >
            <span className="btn-text">NÃO</span>
          </button>
          
          <button 
            onClick={() => abrirModalConfirmacao('ABSTENCAO')} 
            disabled={votando}
            className={`btn-voto btn-abstencao ${votando ? 'btn-disabled' : ''}`}
          >
            <span className="btn-text">ABSTER</span>
          </button>
        </div>
        
        {/* Botão Ver Resultados REMOVIDO */}
        
      </div>

      {/* Modal de Confirmação simplificado - sem nome do usuário */}
      {modalAberto && votoSelecionado && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmar Voto</h3>
              <button className="modal-close" onClick={fecharModal}>×</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-mensagem">
                Realmente deseja votar <strong className={`voto-destaque voto-${votoSelecionado.toLowerCase()}`}>
                  {getTextoVoto(votoSelecionado)}
                </strong>?
              </p>
            </div>
            
            <div className="modal-footer">
              <button className="modal-btn modal-btn-cancelar" onClick={fecharModal}>
                Cancelar
              </button>
              <button 
                className={`modal-btn modal-btn-confirmar modal-btn-${votoSelecionado.toLowerCase()}`} 
                onClick={confirmarVoto}
              >
                Confirmar Voto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Votacao;