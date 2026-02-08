import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This will throw an error if the connection is not established
    await sql`SELECT 1;`;

    // Create the todos table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    return NextResponse.json({ message: 'Database connection successful and table created.' });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ error: 'Database health check failed.' }, { status: 500 });
  }
}
