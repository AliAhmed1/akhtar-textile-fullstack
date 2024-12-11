
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

export async function GET() {

    try {
        const result = await prisma.history.findMany({select:{title:true,created_at:true}});
        // console.log(result);
        return NextResponse.json({ files: result?.reverse(), success: true, status: 200, headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Disable caching for this API route
          }});
    } catch (error) {
        console.error(error);
    }
}