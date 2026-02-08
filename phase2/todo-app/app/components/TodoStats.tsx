// app/components/TodoStats.tsx
import React from 'react';

interface TodoStatsProps {
  total: number;
  completed: number;
  pending: number;
}

export function TodoStats({ total, completed, pending }: TodoStatsProps) {
  const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 shadow rounded-lg mb-4 text-center">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Todos</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completed}</p>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{pending}</p>
      </div>
      {total > 0 && (
        <div className="md:col-span-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Percentage</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}%</p>
        </div>
      )}
    </div>
  );
}
