'use client';

import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function Table<T>({ data, columns, keyExtractor, emptyMessage = 'No data available' }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`py-3 px-4 text-sm text-slate-700 dark:text-slate-300 ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

