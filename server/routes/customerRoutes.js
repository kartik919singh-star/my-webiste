import express from 'express';
import { check } from 'express-validator';
import {
  getCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Search endpoint (placed before parameterized routes to prevent path hijacking)
router.get('/search', searchCustomers);

router.route('/')
  .get(getCustomers)
  .post(
    protect,
    [
      check('name', 'Client name is required').notEmpty().trim(),
      check('phone', 'Customer phone number is required').notEmpty().trim(),
      check('address', 'Delivery address is required').notEmpty().trim(),
      handleValidation,
    ],
    createCustomer
  );

router.route('/:id')
  .put(
    protect,
    [
      check('name', 'Name field cannot be left blank').optional().notEmpty().trim(),
      check('phone', 'Phone field cannot be left blank').optional().notEmpty().trim(),
      check('address', 'Address field cannot be left blank').optional().notEmpty().trim(),
      handleValidation,
    ],
    updateCustomer
  )
  .delete(protect, deleteCustomer);

export default router;
