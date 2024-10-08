import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Initialize the PostgreSQL client
const client = new Client({
  connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
});

client.connect();

// Handler for POST requests
export async function POST(request: NextRequest) {
  const client = new Client({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
  });

  await client.connect();

  try {
  const Data = await request.json();
await client.query('BEGIN');
  for(const data of Data){
    try {

        console.log(data)
        const result = await client.query(
            `INSERT INTO history (title) VALUES ($1)`,[data]
        );
    } catch (error) {
      await client.query('ROLLBACK');
    }
  }
  await client.query('COMMIT');  
  return NextResponse.json({ success: true, message: `Failed to save these files data logged in history` }, { status: 200 });
} catch (error) {
  return NextResponse.json({ success: false, message: 'Failed to save recipe data' }, { status: 500 });
}finally {
  await client.end();
}


}