import express from 'express';
import { check } from 'express-validator';
import {
  getInvoices,
  searchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from '../controllers/invoiceController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/search', searchInvoices);

router.route('/')
  .get(getInvoices)
  .post(
    protect,
    [
      check('customer.name', 'Customer name is required').notEmpty().trim(),
      check('customer.phone', 'Customer phone number is required').notEmpty().trim(),
      check('items', 'Invoice items must be a non-empty list').isArray({ min: 1 }),
      check('subtotal', 'Invoice subtotal must be a valid positive number').isFloat({ min: 0 }),
      check('tax', 'GST tax amount must be a valid positive number').isFloat({ min: 0 }),
      check('grandTotal', 'Grand total must be a valid positive number').isFloat({ min: 0 }),
      handleValidation,
    ],
    createInvoice
  );

router.route('/:id')
  .put(
    protect,
    [
      check('status', 'Invoice status must be Paid, Unpaid, or Pending').optional().isIn(['Paid', 'Unpaid', 'Pending']),
      handleValidation,
    ],
    updateInvoice
  )
  .delete(protect, admin, deleteInvoice);

export default router;
