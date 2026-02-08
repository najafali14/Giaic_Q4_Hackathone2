// app/page.tsx
import { sql, query } from '@/lib/db';
import { Todo } from '@/lib/types';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TodoPageClient } from './components/TodoPageClient';
import { Suspense } from 'react';

interface HomeProps {
  searchParams: {
    filter?: 'all' | 'active' | 'completed';
    search?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const filter = searchParams.filter || 'all';
  const searchTerm = searchParams.search || '';

  let initialTodos: Todo[] = [];
  let error: string | null = null;

  try {
    let baseQuery = 'SELECT * FROM todos';
    const conditions: string[] = [];
    const queryValues: (string | boolean)[] = [];
    let paramCounter = 1;

    if (filter === 'active') {
      conditions.push(`completed = FALSE`);
    } else if (filter === 'completed') {
      conditions.push(`completed = TRUE`);
    }

    if (searchTerm) {
      conditions.push(`(title ILIKE $${paramCounter} OR description ILIKE $${paramCounter})`);
      queryValues.push(`%${searchTerm}%`);
      paramCounter++;
    }

    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    baseQuery += ' ORDER BY created_at DESC;';

    const { rows } = await query<Todo>(baseQuery, queryValues);
    initialTodos = rows;

  } catch (err) {
    console.error('Failed to fetch todos:', err);
    error = 'Failed to load todos.';
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {error ? (
        <main className="container mx-auto p-4 max-w-2xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Todo App</h1>
          <ErrorMessage message={error} />
        </main>
      ) : (
        <TodoPageClient
          initialTodos={initialTodos}
          initialFilter={filter}
        />
      )}
    </Suspense>
  );
}