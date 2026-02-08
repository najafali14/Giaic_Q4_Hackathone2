// app/components/TodoItem.tsx
import React from 'react';
import { Todo } from '@/lib/types';
import { Checkbox } from './Checkbox'; // Assuming a Checkbox component
import { Trash2, Edit } from 'lucide-react'; // Icons

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggleComplete, onDelete, onEdit }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border shadow-sm rounded-lg mb-3">
      <div className="flex items-center">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => onToggleComplete(todo.id, checked as boolean)}
          id={`todo-${todo.id}`}
        />
        <label
          htmlFor={`todo-${todo.id}`}
          className={`ml-4 text-text text-lg ${todo.completed ? 'line-through opacity-70' : ''}`}
        >
          {todo.title}
        </label>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onEdit(todo)}
          className="text-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary p-1 rounded-md transition-colors"
          aria-label="Edit todo"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 p-1 rounded-md transition-colors"
          aria-label="Delete todo"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
