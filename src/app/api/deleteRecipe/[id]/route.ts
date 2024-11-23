// src/app/api/deleteRecipe/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// Export the DELETE method
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params; // Get the ID from the request parameters

  try {
    const result = await prisma.recipes.delete({ where: { id: BigInt(id) } });
    if (result === null) {
      return NextResponse.json({ message: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ message: 'Failed to delete recipe', error}, { status: 500 });
  }
}
