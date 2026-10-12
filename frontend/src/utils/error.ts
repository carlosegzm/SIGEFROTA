import { AxiosError } from 'axios';
import { translateErrorMessage } from './errorMessages';

export const getErrorMessage = (error: unknown, defaultMessage: string = 'Ocorreu um erro.', generic403: boolean = true): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      const translated = translateErrorMessage(error.response.data.message);
      if (translated) {
        return translated;
      }
    }
    
    // Fallbacks por HTTP status
    const status = error.response?.status;
    if (status) {
      if (status === 400) return 'Dados inválidos.';
      if (status === 401) return 'Sessão inválida ou expirada. Faça login novamente.';
      if (status === 403) return generic403 ? 'Você não tem permissão para esta ação.' : defaultMessage;
      if (status === 404) return 'Registro não encontrado.';
      if (status === 409) return 'Este registro já existe.';
      if (status === 422) return 'Operação não permitida.';
      if (status >= 500) return 'Erro interno do servidor. Tente novamente mais tarde.';
    } else {
      // Sem resposta (erro de rede)
      return 'Não foi possível conectar ao servidor.';
    }
  }
  
  return defaultMessage;
};
