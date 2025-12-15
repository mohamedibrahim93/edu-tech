'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

// Column definition for data-driven tables
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

// Props for data-driven table
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ data, columns, keyExtractor, emptyMessage = 'No data found', onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item)}
                  className={`group transition-all duration-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300"
                    >
                      {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple table components for custom layouts
interface SimpleTableProps {
  children: React.ReactNode;
  className?: string;
}

export function SimpleTable({ children, className = '' }: SimpleTableProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50">
        {children}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}

export function TableRow({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      className={`group transition-all duration-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-6 py-4 text-sm text-slate-700 dark:text-slate-300 ${className}`}>
      {children}
    </td>
  );
}

// Empty state component
export function TableEmpty({ message = 'No data found', icon: Icon = Inbox }: { message?: string; icon?: React.ElementType }) {
  return (
    <tr>
      <td colSpan={100} className="py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Icon className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{message}</p>
        </div>
      </td>
    </tr>
  );
}

// Loading state component
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
