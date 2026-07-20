import express from 'express';
import { check } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Operator Registration Endpoint (validated)
router.post(
  '/register',
  [
    check('name', 'Operator name is required').notEmpty().trim(),
    check('email', 'Please enter a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
    handleValidation,
  ],
  registerUser
);

// Operator Login Endpoint (validated)
router.post(
  '/login',
  [
    check('email', 'Please enter a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password is required').notEmpty(),
    handleValidation,
  ],
  loginUser
);

// Logout Endpoint
router.post('/logout', logoutUser);

// Profile Endpoint (guarded by protect)
router.get('/profile', protect, getUserProfile);

export default router;
