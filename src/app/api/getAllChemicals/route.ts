


export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET() {

  try {

    const result = await prisma.chemicals.findMany()

    const resultSerialized = result.map((chemical) => ({
      ...chemical,
      id: chemical.id.toString(),
      kg_per_can: chemical.kg_per_can?.toString(),
      

    }));

    return NextResponse.json({ chemicals: resultSerialized.reverse() }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Disable caching for this API route
      },
    });
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    // client.release();
    prisma.$disconnect();
  }
}
