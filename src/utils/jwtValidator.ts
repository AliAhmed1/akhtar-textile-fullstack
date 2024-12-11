// jwtValidator.ts
import jwt from 'jsonwebtoken';

// Define a type for the JWT payload
interface JwtPayload {
  id?: string;
  name?: string;
  // Add other fields if necessary
}

// Utility function to validate JWT
export const jwtValidator = (token?: string): boolean => {
  if (!token) {
    return false; // Return false for null or undefined tokens
  }

  try {
    const decoded = jwt.decode(token) as JwtPayload;

    // Check if the decoded token has an id
    return !!decoded?.id; // Return true if id exists, false otherwise
  } catch (error) {
    console.error("Token decoding error:", error);
    return false; // Return false on error
  }
};
