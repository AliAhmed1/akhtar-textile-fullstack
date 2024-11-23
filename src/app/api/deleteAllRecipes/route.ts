import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
// import { Pool } from 'pg';

// Set up the connection pool for PostgreSQL
// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
// });

// Export the DELETE method for deleting all recipes
export async function DELETE() {
  try {
    // Delete all recipes from the database
    // const result = await pool.query('DELETE FROM recipes');
    const result = await prisma.recipes.deleteMany({});

    return NextResponse.json({ message: 'All recipes deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting all recipes:', error);
    return NextResponse.json({ message: 'Failed to delete all recipes', error }, { status: 500 });
  }
}
