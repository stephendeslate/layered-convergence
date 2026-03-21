export interface EmbedMessage {
  type: 'ae:set-filters' | 'ae:set-theme' | 'ae:refresh' | 'ae:ready' | 'ae:resize';
  payload?: unknown;
}

export function setupPostMessageListener(handlers: {
  onSetFilters?: (filters: Record<string, unknown>) => void;
  onSetTheme?: (theme: Record<string, string>) => void;
  onRefresh?: () => void;
}) {
  const listener = (event: MessageEvent) => {
    const msg = event.data as EmbedMessage;
    if (!msg || typeof msg.type !== 'string' || !msg.type.startsWith('ae:')) return;

    switch (msg.type) {
      case 'ae:set-filters':
        handlers.onSetFilters?.(msg.payload as Record<string, unknown>);
        break;
      case 'ae:set-theme':
        handlers.onSetTheme?.(msg.payload as Record<string, string>);
        break;
      case 'ae:refresh':
        handlers.onRefresh?.();
        break;
    }
  };

  window.addEventListener('message', listener);

  // Notify host that embed is ready
  notifyHost({ type: 'ae:ready' });

  return () => window.removeEventListener('message', listener);
}

export function notifyHost(message: EmbedMessage) {
  if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

export function notifyResize(height: number) {
  notifyHost({ type: 'ae:resize', payload: { height } });
}
