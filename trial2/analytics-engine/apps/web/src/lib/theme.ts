const THEME_CSS_VARS: Record<string, string> = {
  primaryColor: '--analytics-primary',
  fontFamily: '--analytics-font-family',
  backgroundColor: '--analytics-bg',
  textColor: '--analytics-text',
  borderColor: '--analytics-border',
  chart1: '--analytics-chart-1',
  chart2: '--analytics-chart-2',
  chart3: '--analytics-chart-3',
  chart4: '--analytics-chart-4',
  chart5: '--analytics-chart-5',
};

export function applyTheme(
  branding: Record<string, unknown>,
  themeOverrides: Record<string, unknown>,
): void {
  const merged = { ...branding, ...themeOverrides };
  const root = document.documentElement;

  for (const [key, cssVar] of Object.entries(THEME_CSS_VARS)) {
    const value = merged[key];
    if (typeof value === 'string' && value.length > 0) {
      root.style.setProperty(cssVar, value);
    }
  }
}

export function resetTheme(): void {
  const root = document.documentElement;
  for (const cssVar of Object.values(THEME_CSS_VARS)) {
    root.style.removeProperty(cssVar);
  }
}
