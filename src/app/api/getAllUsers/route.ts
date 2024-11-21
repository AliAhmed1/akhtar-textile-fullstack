export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { users } from '@prisma/client';
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL
// })

export async function GET() {
  // const client = await pool.connect()

  try {
    // const query = 'SELECT * FROM users'
    // const result = await client.query(query)

    // console.log(users);

    const result = await  prisma.users.findMany({})
// console.log(result);
    const resultSerialized = await Promise.all( result.map(async (user: users) => ({
      ...user,
      id: user.id.toString(),
      password: null,
      accesslevels: await prisma.access_levels.findMany({where:{usersid:user.id},select:{accesslevels:true}}),
    }
  )
))

    // delete resultSerialized.password
    // console.log("Fetched users:", resultSerialized[3]);
    return NextResponse.json({ users: resultSerialized }, {
      status: 200,
    
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } 
}
