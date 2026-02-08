// app/components/TodoFilter.tsx
'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type FilterType = 'all' | 'active' | 'completed';

interface TodoFilterProps {
  onFilterChange: (filter: FilterType) => void;
  currentFilter: FilterType;
}

export function TodoFilter({ onFilterChange, currentFilter }: TodoFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterClick = (filter: FilterType) => {
    onFilterChange(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="flex justify-center space-x-2 p-4 bg-white dark:bg-gray-800 shadow rounded-lg mb-4">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilterClick(filter.value)}
          className={twMerge(
            clsx(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              currentFilter === filter.value
                ? "bg-primary text-white hover:bg-primary"
                : "bg-card text-text hover:bg-border"
            )
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
