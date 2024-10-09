import { NextResponse, NextRequest } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { userId?: string; isUnauthorized?: boolean }>();
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // If no token is found, allow the request to proceed
  if (!token) {
    return NextResponse.next(); // Proceed if no token
  }

  // Check if the user ID is cached
  const cachedData = cache.get(token);
  if (cachedData) {
    if (cachedData.isUnauthorized) {
      return NextResponse.next(); // Skip further checks if already marked unauthorized
    }

    // If cached user ID exists, set the header and proceed
    const response = NextResponse.next();
    if (cachedData.userId) {
      response.headers.set('x-user-id', cachedData.userId);
    }
    return response;
  }

  // Call the API to validate the token and get user ID
  const apiUrl = new URL('/api/getToken', request.url);
  const apiResponse = await fetch(apiUrl.toString(), {
    method: 'GET',
    headers: {
      Cookie: `token=${token}`, // Pass the token in cookies
    },
  });

  // Handle the API response
  if (!apiResponse.ok) {
    if (apiResponse.status === 401) {
      // Cache the unauthorized status for this token
      cache.set(token, { isUnauthorized: true });
      return NextResponse.next(); // Return and skip further checks
    }
    
    console.error("API call failed:", await apiResponse.text());
    return NextResponse.next(); // Proceed for other non-200 statuses
  }

  // If valid, extract the user ID from the response
  const userData = await apiResponse.json();

  // Cache the user ID for future requests
  cache.set(token, { userId: userData.id });

  // Create a response and set user ID in the header
  const response = NextResponse.next();
  response.headers.set('x-user-id', userData.id);
  return response; // Return the response with user ID
}

export const config = {
  matcher: ['/:path*'], // Apply middleware to all paths
};