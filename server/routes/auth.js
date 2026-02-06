const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    },
    jwtSecret,
    {
      expiresIn: '7d' // Token expires in 7 days
    }
  );
}

/**
 * Register authentication routes
 * @param {Express.Application} app - Express app instance
 */
function registerAuthRoutes(app) {
  /**
   * POST /api/auth/register
   * Register a new user (optional - can be disabled in production)
   */
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, name, role } = req.body;

      // Validate input
      if (!username || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Username, password, and name are required'
        });
      }

      // Validate username format (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({
          success: false,
          error: 'Username must be 3-20 characters (letters, numbers, underscore only)'
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Validate role
      const validRoles = ['therapist', 'doctor', 'admin'];
      const userRole = role || 'therapist';
      if (!validRoles.includes(userRole)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        });
      }

      const pool = await getPool();

      // Check if username already exists
      const [[existing]] = await pool.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user
      const [result] = await pool.query(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, name, userRole]
      );

      const userId = Number(result.insertId);

      // Generate token
      const token = generateToken({
        id: userId,
        username,
        name,
        role: userRole
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          username,
          name,
          role: userRole
        }
      });
    } catch (error) {
      console.error('[AUTH] Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login with username and password
   */
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const pool = await getPool();

      // Find user
      const [[user]] = await pool.query(
        'SELECT id, username, password, name, role FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  });

  /**
   * GET /api/auth/me
   * Get current user info (requires authentication)
   */
  app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
      const pool = await getPool();

      // Get fresh user data from database
      const [[user]] = await pool.query(
        'SELECT id, username, name, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('[AUTH] Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user info'
      });
    }
  });
}

module.exports = { registerAuthRoutes };
