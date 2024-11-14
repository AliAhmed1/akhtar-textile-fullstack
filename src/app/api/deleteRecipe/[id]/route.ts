// src/app/api/deleteRecipe/[id]/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Set up the connection pool for PostgreSQL
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
});

// Export the DELETE method
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Get the ID from the request parameters

  try {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ message: 'Failed to delete recipe', error}, { status: 500 });
  }
}
