export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { users } from '@prisma/client';
import { NextResponse } from 'next/server'

export async function GET() {

  try {

    const result = await  prisma.users.findMany({})

    const resultSerialized = await Promise.all( result.map(async (user: users) => ({
      ...user,
      id: user.id.toString(),
      password: null,
      accesslevels: await prisma.access_levels.findMany({where:{usersid:user.id},select:{accesslevels:true}}),
    }
  )
))

    return NextResponse.json({ users: resultSerialized }, {
      status: 200,
    
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } 
}
