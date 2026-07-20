import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Retrieve token from Authorization header (Bearer token) or Cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    return next(new Error('Access Denied: No authentication token provided'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500);
      return next(new Error('Server configuration error: JWT secret is missing'));
    }

    const decoded = jwt.verify(token, secret);
    
    // Find the user associated with this token and attach to request context
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401);
      return next(new Error('User account not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Session Expired or Invalid Token. Please log in again.'));
  }
};

// Check for admin role privileges
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Access Forbidden: Admin privileges required'));
  }
};
