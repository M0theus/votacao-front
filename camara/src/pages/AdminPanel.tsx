import * as React from 'react';
import { useState, useEffect } from 'react';
import { votacaoService } from '../services/votacaoService';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  // Verifica autenticação diretamente no localStorage
  useEffect(() => {
    const verificarAutenticacao = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('usuario');
      
      console.log('Verificando autenticacao no localStorage:', { token, userData });
      
      if (!token || !userData) {
        console.log('Nao autenticado - redirecionando para login');
        navigate('/login');
        return false;
      }

      try {
        const usuario = JSON.parse(userData);
        setUsuarioLogado(usuario);
        
        if (usuario.tipo !== 'ADMINISTRADOR') {
          console.log('Nao e administrador - redirecionando para votacao');
          alert('Acesso restrito a administradores');
          navigate('/votacao');
          return false;
        }
        
        console.log('Usuario e administrador - pode continuar');
        return true;
      } catch (error) {
        console.error('Erro ao verificar usuario:', error);
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
      console.log('Carregando usuarios...');
      
      const usuariosData = await authService.listarUsuarios();
      setUsuarios(usuariosData || []);
      console.log('Usuarios carregados:', usuariosData.length);
      
    } catch (error: any) {
      console.error('Erro ao carregar usuarios:', error);
      alert('Erro ao carregar usuarios: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarAusente = async (usuarioId: number, usuarioNome: string) => {
    console.log('Marcando como ausente:', { usuarioId, usuarioNome });
    
    if (window.confirm(`Marcar ${usuarioNome} como ausente?`)) {
      try {
        console.log('Enviando requisicao para marcar ausente...');
        await votacaoService.marcarAusente(usuarioId);
        console.log('Usuario marcado como ausente com sucesso');
        alert(`${usuarioNome} marcado como ausente!`);
        
        carregarUsuarios();
        
      } catch (error: any) {
        console.error('Erro ao marcar como ausente:', error);
        alert('Erro ao marcar como ausente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleFinalizarVotacao = async () => {
    console.log('Finalizando votacao...');
    
    if (window.confirm('Tem certeza que deseja FINALIZAR a votação? Esta ação não pode ser desfeita!')) {
      try {
        console.log('Enviando requisicao para finalizar votacao...');
        await votacaoService.finalizarVotacao();
        console.log('Votacao finalizada com sucesso');
        alert('Votação finalizada com sucesso!');
        
        navigate('/resultado');
        
      } catch (error: any) {
        console.error('Erro ao finalizar votacao:', error);
        alert('Erro ao finalizar votacao: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // FUNÇÃO PARA ZERAR/ABRIR NOVA VOTAÇÃO - ADICIONADA AQUI
  const handleZerarVotacao = async () => {
    console.log('Zerando votacao...');
    
    if (window.confirm('ATENÇÃO: Tem certeza que deseja ZERAR a votação?\n\nIsso irá:\n• Limpar TODOS os votos\n• Reiniciar a votação do zero\n• Manter os usuários cadastrados\n\nEsta ação não pode ser desfeita!')) {
      try {
        console.log('Enviando requisicao para zerar votacao...');
        await votacaoService.zerarVotacao();
        console.log('Votacao zerada com sucesso');
        alert('Votação zerada com sucesso! Nova votação pode ser iniciada.');
        
        // Recarregar a página ou redirecionar
        window.location.reload();
        
      } catch (error: any) {
        console.error('Erro ao zerar votacao:', error);
        alert('Erro ao zerar votacao: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  if (!usuarioLogado) {
    return <div className="container">Verificando autenticacao...</div>;
  }

  if (loading) {
    return <div className="container">Carregando usuarios...</div>;
  }

  return (
    <div className="container">
      <div className="admin-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1>Painel Administrativo - Gerenciar Usuarios</h1>
          <p style={{ color: '#666', margin: 0 }}>Bem-vindo, {usuarioLogado.nome}</p>
        </div>
        
        <div>
          {/* BOTÃO ZERAR VOTAÇÃO - ADICIONADO AQUI */}
          <button 
            onClick={handleZerarVotacao}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Zerar Votação
          </button>

          <button 
            onClick={handleFinalizarVotacao}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Finalizar Votação
          </button>

          <button 
            onClick={() => navigate('/admin/usuarios')}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Gerenciar Usuários
          </button>

          <button 
            onClick={() => navigate('/votacao')}
            style={{ 
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Voltar para Votacao
          </button>
          <button 
            onClick={carregarUsuarios}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Atualizar
          </button>
        </div>
      </div>

      <div className="lista-usuarios">
        <h3>Usuarios Cadastrados ({usuarios.length})</h3>
        
        {usuarios.length === 0 ? (
          <p>Nenhum usuario cadastrado.</p>
        ) : (
          <div className="tabela-usuarios">
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Nome</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>CPF</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Partido</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Tipo</th>
                  <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontWeight: '600' }}>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{user.nome}</td>
                    <td style={{ padding: '15px' }}>{user.cpf}</td>
                    <td style={{ padding: '15px' }}>{user.partido}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        color: user.tipo === 'ADMINISTRADOR' ? '#dc3545' : '#28a745',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: user.tipo === 'ADMINISTRADOR' ? '#f8d7da' : '#d4edda'
                      }}>
                        {user.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => handleMarcarAusente(user.id, user.nome)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
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