// app/components/TodoPageClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Todo, TodoFormInput } from '@/lib/types';
import { TodoList } from './TodoList';
import { TodoForm } from './TodoForm';
import { TodoFilter } from './TodoFilter';
import { TodoStats } from './TodoStats';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useToast } from './ToastProvider';

interface TodoPageClientProps {
  initialTodos: Todo[] | null;
  initialFilter: 'all' | 'active' | 'completed';
}

export function TodoPageClient({ initialTodos = [], initialFilter }: TodoPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [filter, setFilter] = useState(initialFilter);
  const [searchInputValue, setSearchInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showError, setShowError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInputValue);
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchInputValue]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchTerm, pathname, router, searchParams]);

  const fetchUrl = `/api/todos?filter=${filter}${searchTerm ? `&search=${searchTerm}` : ''}`;
  const { data: todos = [], error, isLoading, mutate } = useSWR<Todo[]>(fetchUrl, {
    fallbackData: initialTodos || [],
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (error) {
      setShowError('Failed to load todos. Please try again.');
    } else {
      setShowError(null);
    }
  }, [error]);

  const handleCreateOrUpdateTodo = async (formData: TodoFormInput) => {
    setShowError(null);
    const method = editingTodo ? 'PUT' : 'POST';
    const url = editingTodo ? `/api/todos/${editingTodo.id}` : '/api/todos';

    // Prepare data for API
    const apiData = editingTodo 
      ? { ...formData, id: editingTodo.id }
      : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${method === 'POST' ? 'create' : 'update'} todo.`);
      }

      await mutate(); // Revalidate SWR cache
      setEditingTodo(null); // Clear editing state
      showToast(`${method === 'POST' ? 'Todo created' : 'Todo updated'} successfully!`, 'success');
    } catch (err: any) {
      setShowError(err.message || 'An unexpected error occurred.');
      showToast(err.message || `Failed to ${method === 'POST' ? 'create' : 'update'} todo.`, 'error');
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    setShowError(null);
    
    // Optimistic update
    mutate(
      (currentTodos) =>
        currentTodos?.map((todo) => 
          todo.id === id ? { ...todo, completed } : todo
        ),
      false
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update todo status.');
      }
      
      // Revalidate to ensure data consistency
      mutate();
      showToast('Todo status updated successfully!', 'success');
    } catch (err: any) {
      setShowError(err.message || 'An unexpected error occurred.');
      showToast(err.message || 'Failed to update todo status.', 'error');
      // Revert optimistic update on error
      mutate();
    }
  };

  const handleDeleteTodo = async (id: number) => {
    setShowError(null);
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    // Optimistic update
    mutate((currentTodos) => 
      currentTodos?.filter((todo) => todo.id !== id), 
      false
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete todo.');
      }
      
      // Revalidate to ensure data consistency
      mutate();
      showToast('Todo deleted successfully!', 'success');
    } catch (err: any) {
      setShowError(err.message || 'An unexpected error occurred.');
      showToast(err.message || 'Failed to delete todo.', 'error');
      // Revert optimistic update on error
      mutate();
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setShowError(null);
    // Scroll to form
    document.getElementById('todo-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    if (newFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', newFilter);
    }
    router.push(`?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchTerm('');
  };

  // Calculate stats
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const pending = total - completed;

  return (
    <main className="container mx-auto p-4 max-w-3xl min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        Todo App
      </h1>

      {showError && (
        <div className="mb-4">
          <ErrorMessage message={showError} />
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        {searchInputValue && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 opacity-60 hover:opacity-100 focus:outline-none"
            aria-label="Clear search"
            type="button"
          >
            ×
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6">
        <TodoStats total={total} completed={completed} pending={pending} />
      </div>

      {/* Todo Form */}
      <div className="mb-6" id="todo-form">
        {editingTodo && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Editing: <span className="font-medium">{editingTodo.title}</span>
            </p>
          </div>
        )}
        <TodoForm
          initialData={editingTodo}
          onSubmit={handleCreateOrUpdateTodo}
          isLoading={isLoading}
        />
      </div>

      {/* Filter */}
      <div className="mb-6">
        <TodoFilter onFilterChange={handleFilterChange} currentFilter={filter} />
      </div>

      {/* Loading and Todo List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {todos.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? `No todos found matching "${searchTerm}"` 
                  : filter !== 'all'
                  ? `No ${filter} todos found`
                  : 'No todos yet. Add your first todo above!'}
              </p>
            </div>
          ) : (
            <TodoList
              todos={todos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onEdit={handleEditClick}
            />
          )}
        </>
      )}
    </main>
  );
}