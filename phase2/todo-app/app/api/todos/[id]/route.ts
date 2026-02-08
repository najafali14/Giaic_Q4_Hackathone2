import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { updateTodoSchema, Todo } from '@/lib/types';
import { ZodError } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rows } = await sql<Todo>`SELECT * FROM todos WHERE id = ${id};`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Todo not found.' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(`Failed to fetch todo with id ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch todo.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = updateTodoSchema.parse(body);

    const { title, description, completed } = validatedData;

    const { rows } = await sql<Todo>`
      UPDATE todos
      SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description || null}, description),
        completed = COALESCE(${completed}, completed),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Todo not found.' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error(`Failed to update todo with id ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update todo.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { rowCount } = await sql`DELETE FROM todos WHERE id = ${id};`;

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Todo not found.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Todo deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete todo with id ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete todo.' }, { status: 500 });
  }
}
