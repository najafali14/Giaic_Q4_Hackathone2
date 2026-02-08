// lib/types.ts - Update this file
import { z } from 'zod';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const todoSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  description: z.string().max(1000).optional(),
  completed: z.boolean().default(false),
});

export const updateTodoSchema = todoSchema.extend({
  id: z.number(),
});

// Make completed optional in the type to match the schema
export type TodoFormInput = {
  title: string;
  description?: string;
  completed?: boolean; // Make this optional
  id?: number;
};