'use client';

import { useState, useMemo } from 'react';

interface Props {
  data: Record<string, unknown>[];
  columns: string[];
  pageSize?: number;
}

export function EmbedDataTable({ data, columns, pageSize = 10 }: Props) {
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = av < bv ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir]);

  const pageCount = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  return (
    <div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="cursor-pointer border-b px-3 py-2 text-left text-xs font-medium"
                  style={{ opacity: 0.6 }}
                  onClick={() => handleSort(col)}
                >
                  {col}
                  {sortCol === col && (sortDir === 'asc' ? ' \u2191' : ' \u2193')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map(col => (
                  <td key={col} className="px-3 py-2 text-xs">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-3 py-2 text-xs" style={{ opacity: 0.5 }}>
          <span>Page {page + 1} of {pageCount}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="disabled:opacity-30">Prev</button>
            <button disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)} className="disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
