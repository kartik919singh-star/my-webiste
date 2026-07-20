import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT tokens
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is missing from environment config');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d', // Session valid for 30 days
  });
};

// @desc    Register a new operator
// @route   POST /api/auth/register
// @access  Public (Can be restricted in production)
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Operator with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    if (user) {
      const token = generateToken(user._id);
      
      // Store token in HTTP-only cookie for secure browser environments
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(400);
      throw new Error('Invalid user details submitted');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate operator & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Store in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401);
      throw new Error('Invalid operator email or password credentials');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get operator profile details
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is already loaded by the protect middleware
    if (req.user) {
      res.status(200).json({
        success: true,
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout operator & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
