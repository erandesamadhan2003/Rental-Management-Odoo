import jwt from 'jsonwebtoken'

// Simple middleware to extract clerkId from authorization header
export const extractClerkId = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      })
    }

    // For now, we'll extract the clerkId from the token payload
    // In a real implementation, you'd verify the JWT with Clerk's public key
    const token = authHeader.split(' ')[1]
    
    // Since we're using Clerk on the frontend, we'll trust the clerkId from the token
    // In production, this should be properly verified with Clerk's verification
    try {
      const decoded = jwt.decode(token)
      if (!decoded || !decoded.sub) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        })
      }

      req.user = {
        clerkId: decoded.sub,
        ...req.user
      }
      
      next()
    } catch (jwtError) {
      console.error('JWT decode error:', jwtError)
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    })
  }
}