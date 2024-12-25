// import recipe from '@/app/(auth)/recipe/page';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Handler for POST requests
export async function POST(request: NextRequest) {

  try {
  const Data = await request.json();
  const result = await prisma.history.createMany({data:Data.map((recipe: any) => ({title:recipe}))});
return NextResponse.json({ success: true, message: `Failed to save these files data logged in history` }, { status: 200 });
    // await client.query('COMMIT');  
 }catch (error) {
  return NextResponse.json({ success: false, message: 'Failed to save recipe data'}, { status: 500 });
}}