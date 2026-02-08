import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { todoSchema, Todo } from '@/lib/types';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const { rows } = await sql<Todo>`SELECT * FROM todos ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = todoSchema.parse(body);

    const { title, description, completed } = validatedData;

    const { rows } = await sql<Todo>`
      INSERT INTO todos (title, description, completed)
      VALUES (${title}, ${description || null}, ${completed})
      RETURNING *;
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to create todo:', error);
    return NextResponse.json({ error: 'Failed to create todo.' }, { status: 500 });
  }
}
