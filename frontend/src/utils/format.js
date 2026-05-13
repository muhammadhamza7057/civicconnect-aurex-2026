export function formatDateTime(value) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function formatRelativeTime(value) {
  if (!value) return 'N/A';
  const diff = new Date(value).getTime() - Date.now();
  const minutes = Math.round(Math.abs(diff) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

export function ticketStatusLabel(status = '') {
  return status.replace(/_/g, ' ');
}

export function moneyFormat(number) {
  return new Intl.NumberFormat('en-US').format(number || 0);
}
