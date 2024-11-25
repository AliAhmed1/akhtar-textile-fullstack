import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Export the DELETE method for deleting all recipes
export async function DELETE() {
  try {

    const result = await prisma.recipes.deleteMany({});

    return NextResponse.json({ message: 'All recipes deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting all recipes:', error);
    return NextResponse.json({ message: 'Failed to delete all recipes', error }, { status: 500 });
  }
}
