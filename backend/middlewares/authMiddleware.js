import { Clerk } from '@clerk/clerk-sdk-node';

// Initialize Clerk with API key from environment variables
const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

// Middleware to extract Clerk ID from authorization header
export const extractClerkId = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }
    
    try {
      // Verify the token with Clerk
      const { sub } = await clerk.verifyToken(token);
      
      // Add the Clerk ID to the request object
      req.clerkId = sub;
      
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};