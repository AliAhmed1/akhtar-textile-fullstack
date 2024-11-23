import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  try {

    const result = await prisma.access_levels.findMany({where:{usersid:BigInt(params.id)},select:{accesslevels:true}});
    console.log(result);
    if (result.length === 0) {
      return NextResponse.json({ message: 'UserId not found' }, { status: 404 });
    }

    // Return the user data
    const user = result;
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}