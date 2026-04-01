import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { relatorioService } from '../services/relatorioService';
import './Relatorios.css';

interface Votacao {
  votacaoId: number;
  dataCriacao: string;
  dataEncerramento: string;
  votacaoAtiva: boolean;
  totalVotos: number;
  totalUsuarios: number;
  contagemVotos: {
    SIM: number;
    AUSENTE: number;
    ABSTENCAO: number;
    NAO: number;
  };
  percentualVotos: {
    SIM: number;
    AUSENTE: number;
    ABSTENCAO: number;
    NAO: number;
  };
  votos?: Array<{
    usuarioId: number;
    usuarioNome: string;
    usuarioPartido: string;
    voto: string;
    dataVoto: string;
  }>;
}

const Relatorios: React.FC = () => {
  const [dataBusca, setDataBusca] = useState('');
  const [votacoes, setVotacoes] = useState<Votacao[]>([]);
  const [votacaoSelecionada, setVotacaoSelecionada] = useState<Votacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const buscarVotacoes = async () => {
    if (!dataBusca) {
      setError('Por favor, selecione uma data');
      return;
    }

    setLoading(true);
    setError(null);
    setVotacaoSelecionada(null);

    try {
      const data = await relatorioService.buscarVotacoesPorData(dataBusca);
      setVotacoes(data);
      
      if (data.length === 0) {
        setError('Nenhuma votação encontrada para esta data');
      }
    } catch (err: any) {
      console.error('Erro ao buscar votações:', err);
      setError('Erro ao buscar votações: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const selecionarVotacao = async (id: number) => {
    setLoadingDetalhes(true);
    setError(null);

    try {
      const detalhes = await relatorioService.buscarDetalhesVotacao(id);
      setVotacaoSelecionada(detalhes);
    } catch (err: any) {
      console.error('Erro ao buscar detalhes:', err);
      setError('Erro ao buscar detalhes da votação: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const gerarPDF = async () => {
    if (!votacaoSelecionada) return;

    setLoadingPDF(true);
    setError(null);

    try {
      const pdfBlob = await relatorioService.gerarPDFVotacao(votacaoSelecionada.votacaoId);
      
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingPDF(false);
    }
  };

  const getCorVoto = (voto: string) => {
    switch(voto) {
      case 'SIM': return 'voto-sim';
      case 'NAO': return 'voto-nao';
      case 'ABSTENCAO': return 'voto-abstencao';
      case 'AUSENTE': return 'voto-ausente';
      default: return '';
    }
  };

  return (
    <div className="relatorios-container">
      <div className="relatorios-wrapper">
        <div className="relatorios-header">
          <button onClick={() => navigate('/admin')} className="btn-back">
            ← Voltar
          </button>
          <h1>Relatórios de Votação</h1>
        </div>

        <div className="relatorios-content">
          {/* Seção de Busca */}
          <div className="busca-section">
            <h2>Buscar Votações por Data</h2>
            <div className="busca-form">
              <input
                type="date"
                value={dataBusca}
                onChange={(e) => setDataBusca(e.target.value)}
                className="date-input"
                placeholder="Selecione a data"
              />
              <button 
                onClick={buscarVotacoes} 
                disabled={loading}
                className="btn-buscar"
              >
                {loading ? 'Buscando...' : '🔍 Buscar'}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="error-container">
              <p className="error-message">❌ {error}</p>
              <button onClick={() => setError(null)} className="btn-close-error">
                Fechar
              </button>
            </div>
          )}

          {/* Lista de Votações */}
          {votacoes.length > 0 && (
            <div className="votacoes-lista">
              <h2>Votações encontradas ({votacoes.length})</h2>
              <div className="cards-container">
                {votacoes.map((votacao) => (
                  <div 
                    key={votacao.votacaoId} 
                    className={`card-votacao ${votacaoSelecionada?.votacaoId === votacao.votacaoId ? 'selected' : ''}`}
                    onClick={() => selecionarVotacao(votacao.votacaoId)}
                  >
                    <div className="card-header">
                      <h3>Votação #{votacao.votacaoId}</h3>
                      <span className={`status ${votacao.votacaoAtiva ? 'ativa' : 'encerrada'}`}>
                        {votacao.votacaoAtiva ? '🟢 Ativa' : '🔴 Encerrada'}
                      </span>
                    </div>
                    <div className="card-info">
                      <p><strong>📅 Início:</strong> {formatarData(votacao.dataCriacao)}</p>
                      <p><strong>⏰ Fim:</strong> {formatarData(votacao.dataEncerramento)}</p>
                      <p><strong>👥 Participação:</strong> {votacao.totalVotos} / {votacao.totalUsuarios} votos</p>
                      <p><strong>📊 Percentual:</strong> {((votacao.totalVotos / votacao.totalUsuarios) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-label">SIM</span>
                        <span className="stat-value sim">{votacao.contagemVotos.SIM}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">NÃO</span>
                        <span className="stat-value nao">{votacao.contagemVotos.NAO}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">ABST.</span>
                        <span className="stat-value abstencao">{votacao.contagemVotos.ABSTENCAO}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">AUS.</span>
                        <span className="stat-value ausente">{votacao.contagemVotos.AUSENTE}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes da Votação Selecionada */}
          {loadingDetalhes && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Carregando detalhes da votação...</p>
            </div>
          )}

          {votacaoSelecionada && !loadingDetalhes && (
            <div className="detalhes-section">
              <div className="detalhes-header">
                <h2>Detalhes da Votação #{votacaoSelecionada.votacaoId}</h2>
                <button 
                  onClick={gerarPDF} 
                  disabled={loadingPDF}
                  className="btn-pdf"
                >
                  {loadingPDF ? 'Gerando PDF...' : '📄 Gerar PDF'}
                </button>
              </div>

              <div className="detalhes-grid">
                <div className="info-card">
                  <h3>Informações Gerais</h3>
                  <p><strong>Data de Criação:</strong> {formatarData(votacaoSelecionada.dataCriacao)}</p>
                  <p><strong>Data de Encerramento:</strong> {formatarData(votacaoSelecionada.dataEncerramento)}</p>
                  <p><strong>Status:</strong> {votacaoSelecionada.votacaoAtiva ? 'Ativa' : 'Encerrada'}</p>
                  <p><strong>Total de Usuários:</strong> {votacaoSelecionada.totalUsuarios}</p>
                  <p><strong>Total de Votos:</strong> {votacaoSelecionada.totalVotos}</p>
                </div>

                <div className="grafico-card">
                  <h3>Resultado da Votação</h3>
                  <div className="grafico-barras">
                    <div className="barra-container">
                      <span className="barra-label">SIM</span>
                      <div className="barra-fundo">
                        <div 
                          className="barra-sim" 
                          style={{ width: `${votacaoSelecionada.percentualVotos.SIM}%` }}
                        >
                          {votacaoSelecionada.percentualVotos.SIM}%
                        </div>
                      </div>
                    </div>
                    <div className="barra-container">
                      <span className="barra-label">NÃO</span>
                      <div className="barra-fundo">
                        <div 
                          className="barra-nao" 
                          style={{ width: `${votacaoSelecionada.percentualVotos.NAO}%` }}
                        >
                          {votacaoSelecionada.percentualVotos.NAO}%
                        </div>
                      </div>
                    </div>
                    <div className="barra-container">
                      <span className="barra-label">ABSTENÇÃO</span>
                      <div className="barra-fundo">
                        <div 
                          className="barra-abstencao" 
                          style={{ width: `${votacaoSelecionada.percentualVotos.ABSTENCAO}%` }}
                        >
                          {votacaoSelecionada.percentualVotos.ABSTENCAO}%
                        </div>
                      </div>
                    </div>
                    <div className="barra-container">
                      <span className="barra-label">AUSENTE</span>
                      <div className="barra-fundo">
                        <div 
                          className="barra-ausente" 
                          style={{ width: `${votacaoSelecionada.percentualVotos.AUSENTE}%` }}
                        >
                          {votacaoSelecionada.percentualVotos.AUSENTE}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Votos */}
              {votacaoSelecionada.votos && votacaoSelecionada.votos.length > 0 && (
                <div className="votos-tabela">
                  <h3>Registro de Votos</h3>
                  <div className="tabela-container">
                    <table className="tabela-votos">
                      <thead>
                        <tr>
                          <th>Usuário</th>
                          <th>Partido</th>
                          <th>Voto</th>
                          <th>Data do Voto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {votacaoSelecionada.votos.map((voto, index) => (
                          <tr key={index}>
                            <td>{voto.usuarioNome}</td>
                            <td>{voto.usuarioPartido}</td>
                            <td>
                              <span className={`badge-voto ${getCorVoto(voto.voto)}`}>
                                {voto.voto}
                              </span>
                            </td>
                            <td>{formatarData(voto.dataVoto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Relatorios;