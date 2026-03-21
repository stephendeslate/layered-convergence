import { describe, it, expect } from 'vitest';
import { isValidWidgetType, WIDGET_TYPES, VALID_WIDGET_TYPES } from './widget-types';

describe('Widget Types', () => {
  it('should have 7 widget types', () => {
    expect(VALID_WIDGET_TYPES).toHaveLength(7);
  });

  it('should validate valid widget types', () => {
    expect(isValidWidgetType('line')).toBe(true);
    expect(isValidWidgetType('bar')).toBe(true);
    expect(isValidWidgetType('pie')).toBe(true);
    expect(isValidWidgetType('area')).toBe(true);
    expect(isValidWidgetType('kpi')).toBe(true);
    expect(isValidWidgetType('table')).toBe(true);
    expect(isValidWidgetType('funnel')).toBe(true);
  });

  it('should reject invalid widget types', () => {
    expect(isValidWidgetType('scatter')).toBe(false);
    expect(isValidWidgetType('')).toBe(false);
    expect(isValidWidgetType('LINE')).toBe(false);
  });

  it('should export all type constants', () => {
    expect(WIDGET_TYPES.LINE).toBe('line');
    expect(WIDGET_TYPES.BAR).toBe('bar');
    expect(WIDGET_TYPES.PIE).toBe('pie');
    expect(WIDGET_TYPES.AREA).toBe('area');
    expect(WIDGET_TYPES.KPI).toBe('kpi');
    expect(WIDGET_TYPES.TABLE).toBe('table');
    expect(WIDGET_TYPES.FUNNEL).toBe('funnel');
  });
});
