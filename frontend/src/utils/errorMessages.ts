/**
 * Dicionário de tradução de erros da API.
 * As chaves exatas precisam bater com as mensagens retornadas pelo backend.
 * Caso o backend altere o texto original em inglês, este dicionário deverá ser atualizado.
 */

export const exactMatches: Record<string, string> = {
  "Email already registered!": "E-mail já cadastrado.",
  "Incorrect email or password": "E-mail ou senha incorretos.",
  "Incorrect email or password!": "E-mail ou senha incorretos.",
  "Vehicle with this license plate already exists.": "Já existe um veículo com esta placa.",
  "Vehicle with this plate already exists.": "Já existe um veículo com esta placa.",
  "Driver with this license number already exists.": "Já existe um motorista com este número de CNH.",
  "Current odometer must be greater than the previous odometer": "O odômetro atual deve ser maior que o odômetro anterior.",
  "This vehicle is currently being processed. Try again shortly": "Este veículo está sendo processado no momento. Tente novamente em instantes.",
  "You do not have permission to perform this action": "Você não tem permissão para esta ação.",
  "Invalid or missing token": "Sessão inválida ou expirada. Faça login novamente.",
  "Invalid data": "Dados inválidos.",
  "Invalid request": "Requisição inválida.",
  "Internal server error": "Erro interno do servidor. Tente novamente mais tarde."
};

export const prefixMatches: Record<string, string> = {
  "Vehicle not found": "Veículo não encontrado.",
  "Driver not found": "Motorista não encontrado.",
  "User not found": "Usuário não encontrado.",
  "Maintenance not found": "Manutenção não encontrada.",
  "Document not found": "Documento não encontrado.",
  "Fuel not found": "Abastecimento não encontrado."
};

export function translateErrorMessage(backendMessage: string): string | null {
  if (!backendMessage) return null;
  
  if (exactMatches[backendMessage]) {
    return exactMatches[backendMessage];
  }

  for (const prefix in prefixMatches) {
    if (backendMessage.startsWith(prefix)) {
      return prefixMatches[prefix];
    }
  }

  return null;
}
