import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, resetTheme } from './theme';

describe('Theme Engine', () => {
  beforeEach(() => {
    resetTheme();
  });

  it('applies branding CSS custom properties', () => {
    applyTheme(
      { primaryColor: '#ff0000', fontFamily: 'Roboto, sans-serif' },
      {},
    );

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--analytics-primary')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--analytics-font-family')).toBe('Roboto, sans-serif');
  });

  it('merges themeOverrides on top of branding', () => {
    applyTheme(
      { primaryColor: '#ff0000' },
      { primaryColor: '#00ff00' },
    );

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--analytics-primary')).toBe('#00ff00');
  });

  it('does not apply empty string values', () => {
    applyTheme({ primaryColor: '' }, {});

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--analytics-primary')).toBe('');
  });

  it('resetTheme removes all custom properties', () => {
    applyTheme({ primaryColor: '#ff0000', textColor: '#000000' }, {});
    resetTheme();

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--analytics-primary')).toBe('');
    expect(root.style.getPropertyValue('--analytics-text')).toBe('');
  });

  it('applies chart color overrides', () => {
    applyTheme({}, { chart1: '#aaa', chart2: '#bbb' });

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--analytics-chart-1')).toBe('#aaa');
    expect(root.style.getPropertyValue('--analytics-chart-2')).toBe('#bbb');
  });
});
