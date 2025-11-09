import * as React from 'react';
import { useState, useEffect } from 'react';
import { votacaoService } from '../services/votacaoService';
import type { ResultadoVotacao, Votacao } from '../types';
import './Resultado.css';

const Resultado: React.FC = () => {
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  const [votos, setVotos] = useState<Votacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarDados = async () => {
    try {
      setError('');
      const [resultadoData, votosData] = await Promise.all([
        votacaoService.obterResultado(),
        votacaoService.listarVotos()
      ]);
      
      setResultado(resultadoData);
      setVotos(votosData || []);
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

  if (!resultado) {
    return (
      <div className="resultado-container">
        <div className="no-data">Nenhum resultado disponível</div>
      </div>
    );
  }

  return (
    <div className="resultado-container">
      <div className="resultado-content">
        <div className="main-layout">
          {/* Tabela de Votos */}
          <div className="tabela-section">
            <div className="card">
              <div className="table-container">
                {votos.length === 0 ? (
                  <div className="sem-votos">
                    Nenhum voto registrado ainda.
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
                      {votos.map((voto: any) => {
                        const nome = voto.usuarioNome || 'Usuário não encontrado';
                        const partido = voto.usuarioPartido || voto.partido || 'N/A';
                        const votoValue = voto.voto || 'INDEFINIDO';
                        
                        return (
                          <tr key={voto.id}>
                            <td className="usuario-nome">{nome}</td>
                            <td className="usuario-partido">{partido}</td>
                            <td>
                              <span 
                                className="badge-voto"
                                style={{ backgroundColor: getCorVoto(votoValue) }}
                              >
                                {votoValue}
                              </span>
                            </td>
                            <td className="data-voto">
                              {formatarData(voto.dataVoto)}
                            </td>
                          </tr>
                        );
                      })}
                      {/* Linhas vazias para completar 14 */}
                      {Array.from({ length: Math.max(0, 14 - votos.length) }).map((_, index) => (
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
                    <div className="resumo-valor">{resultado.sim}</div>
                  </div>
                </div>
                
                <div className="resumo-item nao">
                  <div className="resumo-content">
                    <div className="resumo-label">NÃO</div>
                    <div className="resumo-valor">{resultado.nao}</div>
                  </div>
                </div>

                <div className="resumo-item ausente">
                  <div className="resumo-content">
                    <div className="resumo-label">AUSENTES</div>
                    <div className="resumo-valor">{resultado.ausentes}</div>
                  </div>
                </div>

                <div className="resumo-item total">
                  <div className="resumo-content">
                    <div className="resumo-label">TOTAL</div>
                    <div className="resumo-valor">{resultado.totalUsuarios}</div>
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