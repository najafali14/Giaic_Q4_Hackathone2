// app/components/TodoList.tsx
import React from 'react';
import { Todo } from '@/lib/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
  isLoading?: boolean;
}

export function TodoList({ todos, onToggleComplete, onDelete, onEdit, isLoading }: TodoListProps) {
  if (isLoading) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Loading todos...</p>;
  }

  if (todos.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow rounded-lg">
        <p className="text-lg font-medium mb-2">No todos found!</p>
        <p>It looks like you're all caught up. Why not add a new task?</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
