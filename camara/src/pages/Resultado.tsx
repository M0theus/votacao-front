import * as React from 'react';
import { useState, useEffect } from 'react';
import { votacaoService } from '../services/votacaoService';
import { authService } from '../services/authService';
import type { Usuario, Votacao, ResultadoVotacao } from '../types';
import './Resultado.css';

const Resultado: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [votos, setVotos] = useState<Votacao[]>([]);
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarDados = async () => {
    try {
      setError('');
      const [usuariosData, votosData, resultadoData] = await Promise.all([
        authService.listarUsuarios(),
        votacaoService.listarVotos(),
        votacaoService.obterResultado()
      ]);
      
      // Filtrar apenas usuários do tipo NORMAL
      const usuariosNormais = (usuariosData || []).filter(
        (usuario: Usuario) => usuario.tipo === 'NORMAL'
      );
      
      setUsuarios(usuariosNormais);
      setVotos(votosData || []);
      setResultado(resultadoData);
    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da votação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    
    // Auto-atualiza a cada 5 segundos
    const interval = setInterval(carregarDados, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para obter o voto de cada usuário - USANDO A FORMA QUE FUNCIONA
  const obterVotoUsuario = (usuario: Usuario) => {
    const votoUsuario = votos.find(voto => 
      (voto as any).usuarioId === usuario.id
    );

    if (votoUsuario) {
      return {
        voto: votoUsuario.voto || 'INDEFINIDO',
        dataVoto: votoUsuario.dataVoto
      };
    }

    return {
      voto: 'NÃO VOTOU',
      dataVoto: null
    };
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const getCorVoto = (voto: string) => {
    switch (voto) {
      case 'SIM': return '#27ae60';
      case 'NAO': return '#e74c3c';
      case 'AUSENTE': return '#3498db';
      case 'NÃO VOTOU': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="resultado-container">
        <div className="loading">Carregando resultados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resultado-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="resultado-container">
      <div className="resultado-content">
        <div className="main-layout">
          {/* Tabela de Usuários com Votos */}
          <div className="tabela-section">
            <div className="card">
              <div className="table-container">
                {usuarios.length === 0 ? (
                  <div className="sem-votos">
                    Nenhum usuário cadastrado.
                  </div>
                ) : (
                  <table className="tabela-votos">
                    <thead>
                      <tr>
                        <th className="col-usuario">Usuário</th>
                        <th className="col-partido">Partido</th>
                        <th className="col-voto">Voto</th>
                        <th className="col-data">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((usuario) => {
                        const votoInfo = obterVotoUsuario(usuario);
                        
                        return (
                          <tr key={usuario.id}>
                            <td className="usuario-nome">{usuario.nome}</td>
                            <td className="usuario-partido">{usuario.partido}</td>
                            <td>
                              <span 
                                className="badge-voto"
                                style={{ backgroundColor: getCorVoto(votoInfo.voto) }}
                              >
                                {votoInfo.voto}
                              </span>
                            </td>
                            <td className="data-voto">
                              {votoInfo.dataVoto 
                                ? formatarData(votoInfo.dataVoto)
                                : '-'
                              }
                            </td>
                          </tr>
                        );
                      })}
                      {/* Linhas vazias para completar 14 */}
                      {Array.from({ length: Math.max(0, 14 - usuarios.length) }).map((_, index) => (
                        <tr key={`empty-${index}`} className="linha-vazia">
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Resumo da Votação - Lado direito empilhado */}
          <div className="resumo-lateral">
            <div className="card resumo-card">
              <div className="resumo-vertical">
                <div className="resumo-item sim">
                  <div className="resumo-content">
                    <div className="resumo-label">SIM</div>
                    <div className="resumo-valor">{resultado?.sim || 0}</div>
                  </div>
                </div>
                
                <div className="resumo-item nao">
                  <div className="resumo-content">
                    <div className="resumo-label">NÃO</div>
                    <div className="resumo-valor">{resultado?.nao || 0}</div>
                  </div>
                </div>

                <div className="resumo-item ausente">
                  <div className="resumo-content">
                    <div className="resumo-label">AUSENTES</div>
                    <div className="resumo-valor">{resultado?.ausentes || 0}</div>
                  </div>
                </div>

                <div className="resumo-item total">
                  <div className="resumo-content">
                    <div className="resumo-label">TOTAL</div>
                    <div className="resumo-valor">{resultado?.totalUsuarios || usuarios.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resultado;