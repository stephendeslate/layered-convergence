// Minimal cn utility — no external dependency needed
export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter((x): x is string => typeof x === 'string' && x.length > 0).join(' ');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
    case 'PUBLISHED':
      return 'text-emerald-600 bg-emerald-50';
    case 'RUNNING':
      return 'text-blue-600 bg-blue-50';
    case 'FAILED':
      return 'text-red-600 bg-red-50';
    case 'IDLE':
    case 'DRAFT':
      return 'text-gray-600 bg-gray-50';
    case 'ARCHIVED':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getConnectorLabel(type: string): string {
  switch (type) {
    case 'REST_API': return 'REST API';
    case 'POSTGRESQL': return 'PostgreSQL';
    case 'CSV': return 'CSV Upload';
    case 'WEBHOOK': return 'Webhook';
    default: return type;
  }
}

export function getConnectorIcon(type: string): string {
  switch (type) {
    case 'REST_API': return 'Globe';
    case 'POSTGRESQL': return 'Database';
    case 'CSV': return 'FileSpreadsheet';
    case 'WEBHOOK': return 'Webhook';
    default: return 'Plug';
  }
}
