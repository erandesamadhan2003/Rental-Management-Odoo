import { clerkClient } from '@clerk/clerk-sdk-node';

export const extractClerkId = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    // Verify the token with Clerk
    const sessionClaims = await clerkClient.verifyToken(token);
    
    if (!sessionClaims || !sessionClaims.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Add the Clerk user ID to the request object
    req.clerkId = sessionClaims.sub;
    req.sessionClaims = sessionClaims;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

export const requireAuth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify the token with Clerk
    const sessionClaims = await clerkClient.verifyToken(token);
    
    if (!sessionClaims) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Add user info to request
    req.clerkId = sessionClaims.sub;
    req.sessionClaims = sessionClaims;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await requireAuth(req, res, () => {});
    
    // Check if user has admin role in session claims
    const userRole = req.sessionClaims?.role || req.sessionClaims?.public_metadata?.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(403).json({
      success: false,
      message: 'Admin verification failed',
      error: error.message
    });
  }
};

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