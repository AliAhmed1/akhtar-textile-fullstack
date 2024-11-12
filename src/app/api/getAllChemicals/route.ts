// export const fetchCache = 'force-no-store';
// export const dynamic = 'force-dynamic';

// import { NextResponse } from 'next/server'
// import { Pool } from 'pg'

// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL
// })

// export async function GET() {
//   const client = await pool.connect()

//   try {
//     const query = `SELECT * FROM chemicals WHERE name != 'Chemical Name';
//                   `
//     const result = await client.query(query)


//     return NextResponse.json({ chemicals: result.rows }, {
//       status: 200,
//       headers: {
//         'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Disable caching for this API route
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching chemicals:', error)
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
//   } finally {
//     client.release() 
//   }
// }


export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.NEXT_PUBLIC_DATABASE_URL
// });

export async function GET() {
  // const client = await pool.connect();
  try {
    // Use DISTINCT to select unique chemicals
    // const query = `
    //   SELECT DISTINCT name, full_name, cost_per_kg, kg_per_can, cost_per_unit, cost_uom, type_and_use, unit_used, unit_conversion
    //   FROM chemicals
    //   WHERE name != 'Chemical Name';
    // `;
    // const result = await client.query(query);

    const result = await prisma.chemicals.findMany()
    console.log(result);
    const resultSerialized = result.map((chemical) => ({
      ...chemical,
      id: chemical.id.toString(),
      kg_per_can: chemical.kg_per_can?.toString(),
      

    }));
    // console.log(resultSerialized);
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
