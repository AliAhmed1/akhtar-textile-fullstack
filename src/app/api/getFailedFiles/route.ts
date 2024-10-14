
import { stat } from "fs";
import { NextResponse } from "next/server";
import { Pool } from "pg";
export const dynamic = 'force-dynamic';
const pool = new Pool({ connectionString: process.env.NEXT_PUBLIC_DATABASE_URL });

export async function GET() {
    const client = await pool.connect();
    try {
const query = `SELECT title, created_at FROM history;`;
const result = await client.query(query);
// console.log(result);
        return NextResponse.json({ files: result?.rows?.reverse(), success: true, status: 200, headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Disable caching for this API route
          }});
    } catch (error) {
        console.error(error);
    } finally {
        client.release();
    }
}