import api from './api';

export const relatorioService = {
  
  buscarVotacoesPorData: async (data: string): Promise<any[]> => {
    try {
      const response = await api.get(`/relatorio-votacao/data?data=${data}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar votações:', error);
      throw error;
    }
  },

  
  buscarDetalhesVotacao: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`/relatorio-votacao/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes da votação:', error);
      throw error;
    }
  },

  
  gerarPDFVotacao: async (id: number): Promise<Blob> => {
    try {
      const response = await api.get(`/relatorio-votacao/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  },

  
  gerarRelatorioVotacao: async (): Promise<Blob> => {
    try {
      const response = await api.get('/relatorios/votacao', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de votação:', error);
      throw error;
    }
  },

  gerarRelatorioAusentes: async (): Promise<Blob> => {
    try {
      const response = await api.get('/relatorios/ausentes', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de ausentes:', error);
      throw error;
    }
  },

  gerarRelatorioParticipacao: async (): Promise<Blob> => {
    try {
      const response = await api.get('/relatorios/participacao', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório de participação:', error);
      throw error;
    }
  }
};