'use client';

interface FunnelWidgetProps {
  data: Record<string, unknown>[];
  config: {
    stages: Array<{
      name: string;
      metric: string;
    }>;
  };
  title?: string;
}

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

export function FunnelWidget({ data, config, title }: FunnelWidgetProps) {
  const firstRow = data[0] ?? {};

  const stages = config.stages.map((stage, i) => ({
    name: stage.name,
    value: Number(firstRow[stage.metric] ?? 0),
    color: COLORS[i % COLORS.length],
  }));

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="h-full w-full p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <div className="flex flex-col gap-2 h-[calc(100%-2rem)]">
        {stages.map((stage, i) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const conversionRate =
            i > 0 && stages[i - 1].value > 0
              ? ((stage.value / stages[i - 1].value) * 100).toFixed(1)
              : null;

          return (
            <div key={stage.name} className="flex items-center gap-2">
              <div className="w-20 text-xs text-slate-600 text-right truncate">
                {stage.name}
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-8 rounded flex items-center justify-center text-xs text-white font-medium transition-all"
                  style={{
                    width: `${Math.max(widthPercent, 5)}%`,
                    backgroundColor: stage.color,
                  }}
                >
                  {stage.value.toLocaleString()}
                </div>
              </div>
              {conversionRate && (
                <div className="w-14 text-xs text-slate-400">{conversionRate}%</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
