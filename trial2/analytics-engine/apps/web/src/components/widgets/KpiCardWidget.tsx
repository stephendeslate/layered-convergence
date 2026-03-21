'use client';

interface KpiCardWidgetProps {
  data: Record<string, unknown>[];
  config: {
    metric: string;
    prefix?: string;
    suffix?: string;
    format?: string;
    comparisonPeriod?: string;
  };
  title?: string;
}

function formatValue(value: number, format?: string, prefix?: string, suffix?: string): string {
  let formatted: string;

  switch (format) {
    case 'currency':
      formatted = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      break;
    case 'percent':
      formatted = `${(value * 100).toFixed(1)}%`;
      break;
    case 'compact':
      formatted = Intl.NumberFormat(undefined, { notation: 'compact' }).format(value);
      break;
    default:
      formatted = value.toLocaleString();
  }

  return `${prefix ?? ''}${formatted}${suffix ?? ''}`;
}

export function KpiCardWidget({ data, config, title }: KpiCardWidgetProps) {
  const currentValue = data.length > 0
    ? Number(data[0][config.metric] ?? 0)
    : 0;

  const previousValue = data.length > 1
    ? Number(data[1][config.metric] ?? 0)
    : undefined;

  const changePercent = previousValue !== undefined && previousValue !== 0
    ? ((currentValue - previousValue) / previousValue) * 100
    : undefined;

  return (
    <div className="h-full w-full p-4 flex flex-col justify-center items-center">
      {title && <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>}
      <p className="text-3xl font-bold">
        {formatValue(currentValue, config.format, config.prefix, config.suffix)}
      </p>
      {changePercent !== undefined && (
        <p
          className={`text-sm mt-1 ${
            changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
