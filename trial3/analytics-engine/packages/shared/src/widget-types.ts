export const WIDGET_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
  KPI: 'kpi',
  TABLE: 'table',
  FUNNEL: 'funnel',
} as const;

export type WidgetType = (typeof WIDGET_TYPES)[keyof typeof WIDGET_TYPES];

export const VALID_WIDGET_TYPES = Object.values(WIDGET_TYPES);

export function isValidWidgetType(type: string): type is WidgetType {
  return VALID_WIDGET_TYPES.includes(type as WidgetType);
}
