'use client';

interface TableWidgetProps {
  data: Record<string, unknown>[];
  config: {
    columns: Array<{
      field: string;
      label: string;
      sortable?: boolean;
    }>;
    pageSize?: number;
  };
  title?: string;
}

export function TableWidget({ data, config, title }: TableWidgetProps) {
  const pageSize = config.pageSize ?? 10;
  const displayData = data.slice(0, pageSize);

  return (
    <div className="h-full w-full p-4 overflow-auto">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            {config.columns.map((col) => (
              <th
                key={col.field}
                className="text-left py-2 px-3 font-medium text-slate-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
              {config.columns.map((col) => (
                <td key={col.field} className="py-2 px-3">
                  {String(row[col.field] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > pageSize && (
        <p className="text-xs text-slate-400 mt-2">
          Showing {pageSize} of {data.length} rows
        </p>
      )}
    </div>
  );
}
