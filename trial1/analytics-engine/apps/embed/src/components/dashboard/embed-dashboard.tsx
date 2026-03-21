'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Dashboard, Widget } from '@analytics-engine/shared';
import { EmbedWidgetRenderer } from './widget-renderer';
import { connectSSE } from '@/lib/sse';
import { setupPostMessageListener, notifyResize } from '@/lib/post-message';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  cornerRadius: number;
  logoUrl: string | null;
}

interface EmbedDashboardProps {
  dashboard: Dashboard;
  theme: ThemeConfig;
  apiKey?: string;
}

export function EmbedDashboard({ dashboard, theme, apiKey }: EmbedDashboardProps) {
  const [widgetData, setWidgetData] = useState<Record<string, unknown[]>>({});
  const [themeOverrides, setThemeOverrides] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const widgets = dashboard.widgets ?? [];

  const effectiveTheme = {
    ...theme,
    ...(themeOverrides.primaryColor && { primaryColor: themeOverrides.primaryColor }),
    ...(themeOverrides.backgroundColor && { backgroundColor: themeOverrides.backgroundColor }),
    ...(themeOverrides.textColor && { textColor: themeOverrides.textColor }),
    ...(themeOverrides.fontFamily && { fontFamily: themeOverrides.fontFamily }),
  };

  // SSE connection for real-time updates
  useEffect(() => {
    const disconnect = connectSSE(dashboard.id, apiKey, (event) => {
      setWidgetData((prev) => ({
        ...prev,
        [event.widgetId]: event.data,
      }));
    });
    return disconnect;
  }, [dashboard.id, apiKey]);

  // postMessage listener
  const handleRefresh = useCallback(() => {
    // Reset widget data to trigger re-fetch
    setWidgetData({});
  }, []);

  useEffect(() => {
    return setupPostMessageListener({
      onSetTheme: (overrides) => setThemeOverrides(overrides),
      onRefresh: handleRefresh,
    });
  }, [handleRefresh]);

  // Report height to host
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        notifyResize(entry.contentRect.height);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: effectiveTheme.backgroundColor,
        color: effectiveTheme.textColor,
        fontFamily: effectiveTheme.fontFamily,
        minHeight: '100vh',
        padding: '16px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        {effectiveTheme.logoUrl && (
          <img
            src={effectiveTheme.logoUrl}
            alt="Logo"
            style={{ height: 24, width: 'auto', objectFit: 'contain' }}
          />
        )}
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{dashboard.name}</h1>
      </div>

      {/* CSS Grid layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dashboard.gridColumns}, 1fr)`,
          gap: 12,
        }}
      >
        {widgets.map((widget: Widget) => (
          <div
            key={widget.id}
            style={{
              gridColumnStart: widget.gridColumnStart,
              gridColumnEnd: `span ${widget.gridColumnSpan}`,
              gridRowStart: widget.gridRowStart,
              gridRowEnd: `span ${widget.gridRowSpan}`,
              backgroundColor: effectiveTheme.backgroundColor,
              border: `1px solid ${effectiveTheme.textColor}10`,
              borderRadius: effectiveTheme.cornerRadius,
              padding: 12,
              overflow: 'hidden',
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{widget.title}</p>
              {widget.subtitle && (
                <p style={{ fontSize: 11, opacity: 0.5, margin: '2px 0 0' }}>{widget.subtitle}</p>
              )}
            </div>
            <EmbedWidgetRenderer
              widget={widget}
              height={widget.gridRowSpan * 200 - 60}
              apiKey={apiKey}
              primaryColor={effectiveTheme.primaryColor}
              overrideData={widgetData[widget.id] ?? null}
            />
          </div>
        ))}
      </div>

      {/* Powered by badge (Free tier) */}
      {theme.primaryColor && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, opacity: 0.4 }}>
          Powered by Analytics Engine
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
