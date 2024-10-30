import { message } from "antd";
export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
export async function GET(request:any) {
    let stepsResult:any;
    let chemicalsResult:any;
    let chemicalsAssocResult:any;

    try{
        const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    // console.log(startDate)
    // console.log(endDate)
    const client = await pool.connect();

    if (!startDate || !endDate) {
      return new NextResponse('Start date and end date are required', { status: 400 });
    }    
    const recipesResult = await client.query(
      `SELECT * FROM recipes 
       WHERE created_at >= $1 AND created_at < $2`, 
       [startDate, new Date(new Date(endDate).setHours(23, 59, 59)).toISOString()]
    );
    
    stepsResult = await client.query('SELECT * FROM steps');
    chemicalsResult = await client.query('SELECT * FROM chemicals');
    chemicalsAssocResult= await client.query('SELECT * FROM chemical_association');
client.release()
    return NextResponse.json({success: true, files: {stepsResult,chemicalsResult,chemicalsAssocResult,recipesResult},status: 200}, {headers: {'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'}});
    } catch (error) {
        console.error('Failed to export recipes:', error);
        return new NextResponse('Error exporting recipes', { status: 500 });
      }
}