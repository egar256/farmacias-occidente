// Format currency in Quetzales
export function formatCurrency(value) {
  const num = parseFloat(value || 0);
  return `Q ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Format date to DD/MM/YYYY
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Convert DD/MM/YYYY to YYYY-MM-DD
export function parseDateToISO(dateString) {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}

// Format date for input (YYYY-MM-DD)
export function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse number from input
export function parseNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}
