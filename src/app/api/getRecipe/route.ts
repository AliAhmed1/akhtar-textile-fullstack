// src/app/api/getRecipe/route.ts
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

import { jwtValidator } from '@/utils/jwtValidator';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.NEXT_PUBLIC_DATABASE_URL });


export async function GET(request: NextRequest) {

  const authHeader = request.headers.get('Authorization');
  const token =authHeader?.split(' ')[1];

  const isValid = jwtValidator(token);
  console.log(isValid);
  try {
    const result = await pool.query('SELECT * FROM "recipes"');
    // console.log(">>>>>>>",result)
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
