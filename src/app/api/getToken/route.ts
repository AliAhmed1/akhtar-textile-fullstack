import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

// Secret key for JWT (use environment variable for better security)
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || "";

// Function to get the user details (id) from the JWT token
export async function GET(request: NextRequest) {
  try {
    // Get the 'token' cookie from the request headers
    const token = request.cookies.get('token')?.value;

    // If no token is found, return an error response
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 401 });
    }

    // Extract user id from the token payload
    const decodedToken = jwt.verify(token, JWT_SECRET) as { id?: string };

    // Check if the user ID is present in the token
    const { id } = decodedToken;
    if (!id) {
      cookies().delete('token');
      return NextResponse.json({ error: 'User ID not found in token' }, { status: 401 });
    }
    // Return user details in the response
    return NextResponse.json({ id });

  } catch (error) {
    console.error("Invalid or missing token:", error);
    cookies().delete('token');
    return NextResponse.json({ error: 'Invalid or missing token' }, { status: 401 });
  }
}