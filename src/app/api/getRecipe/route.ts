// src/app/api/getRecipe/route.ts
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.NEXT_PUBLIC_DATABASE_URL });


export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "recipes"');
    // console.log(">>>>>>>",result)
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
