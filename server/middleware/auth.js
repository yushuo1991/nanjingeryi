const jwt = require('jsonwebtoken');

/**
 * Authentication middleware - verifies JWT token
 * Adds user object to req.user if token is valid
 */
function authMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>'
      });
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('[AUTH] JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        error: 'Authentication not configured on server'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Add user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    console.error('[AUTH] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Role-based authorization middleware
 * Checks if authenticated user has required role(s)
 *
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 *
 * @example
 * // Single role
 * app.delete('/api/patients/:id', authMiddleware, roleMiddleware('doctor'), handler);
 *
 * // Multiple roles
 * app.post('/api/patients', authMiddleware, roleMiddleware(['doctor', 'admin']), handler);
 */
function roleMiddleware(allowedRoles) {
  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  roleMiddleware
};
