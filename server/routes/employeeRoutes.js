import express from 'express';
import { check } from 'express-validator';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEmployees)
  .post(
    protect,
    admin,
    [
      check('name', 'Employee name is required').notEmpty().trim(),
      check('phone', 'Phone number is required').notEmpty().trim(),
      check('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
      check('designation', 'Designation title is required').notEmpty().trim(),
      check('salary', 'Monthly salary must be a positive number').isFloat({ min: 0 }),
      handleValidation,
    ],
    createEmployee
  );

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(
    protect,
    admin,
    [
      check('name', 'Employee name cannot be blank').optional().notEmpty().trim(),
      check('email', 'Invalid email format').optional().isEmail().normalizeEmail(),
      check('salary', 'Salary must be a positive number').optional().isFloat({ min: 0 }),
      handleValidation,
    ],
    updateEmployee
  )
  .delete(protect, admin, deleteEmployee);

export default router;
