// src/app/api/getRecipe/route.ts
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { jwtValidator } from '@/utils/jwtValidator';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {

  const authHeader = request.headers.get('Authorization');
  const token =authHeader?.split(' ')[1];

  const isValid = jwtValidator(token);
  console.log(isValid);
  try {
    let result = await prisma.recipes.findMany();
    result = result.map((recipe: any) => ({
      ...recipe,
      id: recipe.id.toString(),
      load_size: recipe.load_size? recipe.load_size.toString(): null,
      recipe: recipe.recipe? recipe.recipe.toString(): null,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
