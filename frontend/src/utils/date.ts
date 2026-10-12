import { format } from 'date-fns';

/**
 * Retorna a data atual local no formato YYYY-MM-DD.
 */
export function todayLocalISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cria um objeto Date local a partir de uma string "YYYY-MM-DD"
 * sem deslocar o fuso horário para UTC, assumindo meia-noite local.
 */
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data ISO "YYYY-MM-DD" (ou qualquer ISO válido) para "DD/MM/YYYY" local.
 */
export function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  // Se vier no formato ISO completo (ex: 2026-10-10T00:00:00Z), removemos a parte de tempo para parseLocalDate, 
  // ou lidamos com ela. Mas geralmente na listagem recebemos 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss...'
  const datePart = isoDate.split('T')[0];
  const dateObj = parseLocalDate(datePart);
  return format(dateObj, 'dd/MM/yyyy');
}
