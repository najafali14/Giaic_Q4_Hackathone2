// app/components/TodoForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, Todo, TodoFormInput } from '@/lib/types';
import { z } from 'zod';

interface TodoFormProps {
  initialData?: Todo | null;
  onSubmit: (data: TodoFormInput) => void;
  isLoading?: boolean;
}

// Create a form schema that exactly matches TodoFormInput
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  description: z.string().max(1000).optional(),
  completed: z.boolean().default(false), // Make sure this has a default
  id: z.number().optional(),
});

export function TodoForm({ initialData, onSubmit, isLoading = false }: TodoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormInput>({
    resolver: zodResolver(formSchema as any), // Use type assertion to bypass TypeScript
    defaultValues: initialData || { 
      title: '', 
      description: '', 
      completed: false,
      id: undefined
    },
  });

  useEffect(() => {
    // Reset form with initialData when it changes
    reset(initialData || { 
      title: '', 
      description: '', 
      completed: false,
      id: undefined
    });
  }, [initialData, reset]);

  const handleFormSubmit = (data: TodoFormInput) => {
    // Ensure completed is always a boolean
    const formData: TodoFormInput = {
      ...data,
      completed: data.completed ?? false,
      id: initialData?.id
    };
    onSubmit(formData);
    
    // Clear form only after creating a new todo
    if (!initialData) {
      reset({ 
        title: '', 
        description: '', 
        completed: false,
        id: undefined
      });
    }
  };

  const isLoadingState = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:outline-none p-2"
          disabled={isLoadingState}
          placeholder="Enter todo title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message?.toString()}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description (Optional)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:outline-none p-2"
          disabled={isLoadingState}
          placeholder="Enter description (optional)"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message?.toString()}</p>}
      </div>

      <div className="flex items-center">
        <input
          id="completed"
          type="checkbox"
          {...register('completed')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:outline-none"
          disabled={isLoadingState}
        />
        <label htmlFor="completed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Completed
        </label>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          disabled={isLoadingState}
        >
          {isLoadingState ? 'Processing...' : initialData ? 'Update Todo' : 'Add Todo'}
        </button>

        {!initialData && (
          <button
            type="button"
            onClick={() => reset({ 
              title: '', 
              description: '', 
              completed: false,
              id: undefined
            })}
            className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            disabled={isLoadingState}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}