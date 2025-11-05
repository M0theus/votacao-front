import * as React from 'react';
import { useState, useEffect } from 'react';
import { votacaoService } from '../services/votacaoService';
import type { ResultadoVotacao, Votacao } from '../types';

const Resultado: React.FC = () => {
  const [resultado, setResultado] = useState<ResultadoVotacao | null>(null);
  const [votos, setVotos] = useState<Votacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Carregando dados públicos...');
      
      // Carrega resultados e votos simultaneamente
      const [resultadoData, votosData] = await Promise.all([
        votacaoService.obterResultado(),
        votacaoService.listarVotos()
      ]);
      
      console.log('✅ Dados carregados:', { resultadoData, votosData });
      
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
  }, []);

  // Função para formatar a data
  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  // Função para obter a cor do voto
  const getCorVoto = (voto: string) => {
    switch (voto) {
      case 'SIM': return '#28a745'; // Verde
      case 'NAO': return '#dc3545'; // Vermelho
      case 'AUSENTE': return '#17a2b8'; // Azul claro
      default: return '#6c757d'; // Cinza
    }
  };

  if (loading) {
    return <div className="container">Carregando resultados...</div>;
  }

  if (error) {
    return <div className="container error">{error}</div>;
  }

  if (!resultado) {
    return <div className="container">Nenhum resultado disponível</div>;
  }

  const totalVotos = resultado.sim + resultado.nao;

  return (
    <div className="container">
      <h2>Resultado da Votação</h2>
      
      {/* Estatísticas */}
      <div className="resultado-container">
        <div className="estatisticas">
          <div className="estatistica-item">
            <h3>Votos SIM</h3>
            <div 
              className="numero" 
              style={{ color: '#28a745', fontSize: '2.5em', fontWeight: 'bold' }}
            >
              {resultado.sim}
            </div>
          </div>

          <div className="estatistica-item">
            <h3>Votos NÃO</h3>
            <div 
              className="numero" 
              style={{ color: '#dc3545', fontSize: '2.5em', fontWeight: 'bold' }}
            >
              {resultado.nao}
            </div>
          </div>

          <div className="estatistica-item">
            <h3>Ausentes</h3>
            <div 
              className="numero" 
              style={{ color: '#17a2b8', fontSize: '2.5em', fontWeight: 'bold' }}
            >
              {resultado.ausentes}
            </div>
          </div>

          <div className="estatistica-item">
            <h3>Total de Votos</h3>
            <div 
              className="numero" 
              style={{ color: '#6c757d', fontSize: '2.5em', fontWeight: 'bold' }}
            >
              {resultado.totalUsuarios}
            </div>
          </div>
        </div>

        {/* Barra de progresso - Opcional, pode remover se quiser */}
        {totalVotos > 0 && (
          <div className="barra-progresso">
            <div 
              className="barra-sim" 
              style={{ 
                width: `${(resultado.sim / totalVotos) * 100}%`,
                backgroundColor: '#28a745'
              }}
            >
              SIM: {resultado.sim}
            </div>
            <div 
              className="barra-nao" 
              style={{ 
                width: `${(resultado.nao / totalVotos) * 100}%`,
                backgroundColor: '#dc3545'
              }}
            >
              NÃO: {resultado.nao}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Votos Detalhados */}
      <div className="lista-votos" style={{ marginTop: '40px' }}>
        <h3>Votos Detalhados</h3>
        
        {votos.length === 0 ? (
          <p>Nenhum voto registrado ainda.</p>
        ) : (
          <div className="tabela-votos">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Usuário</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Partido</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Voto</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {votos.map((voto) => {
                  // Verificação de segurança para evitar erros
                  const usuario = voto.usuario || {};
                  const nome = usuario.nome || 'Usuário não encontrado';
                  const partido = usuario.partido || 'N/A';
                  const votoValue = voto.voto || 'INDEFINIDO';
                  
                  return (
                    <tr key={voto.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{nome}</td>
                      <td style={{ padding: '12px' }}>{partido}</td>
                      <td style={{ padding: '12px' }}>
                        <span 
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            backgroundColor: getCorVoto(votoValue),
                            display: 'inline-block',
                            minWidth: '60px',
                            textAlign: 'center'
                          }}
                        >
                          {votoValue}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#666' }}>
                        {formatarData(voto.dataVoto)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div>
          <strong>Total de participantes:</strong> {resultado.totalUsuarios}
        </div>
        <div>
          <strong>Votos computados:</strong> {votos.length}
        </div>
        <div>
          <strong>Ausentes:</strong> {resultado.ausentes}
        </div>
        <div>
          <strong>Votos válidos:</strong> {resultado.sim + resultado.nao}
        </div>
      </div>

      <button 
        onClick={carregarDados} 
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Atualizar Dados
      </button>
    </div>
  );
};

export default Resultado;