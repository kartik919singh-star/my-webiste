import express from 'express';
import { check } from 'express-validator';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPayments)
  .post(
    protect,
    [
      check('invoice', 'Valid Invoice database ID reference is required').isMongoId(),
      check('customer', 'Valid Customer database ID reference is required').isMongoId(),
      check('amount', 'Payment amount must be a positive number').isFloat({ min: 0 }),
      check('paymentMethod', 'Payment method must be Cash, Card, UPI, or Bank Transfer').isIn([
        'Cash',
        'Card',
        'UPI',
        'Bank Transfer',
      ]),
      handleValidation,
    ],
    createPayment
  );

router.route('/:id')
  .put(
    protect,
    [
      check('status', 'Payment status must be Success, Pending, or Failed').optional().isIn(['Success', 'Pending', 'Failed']),
      handleValidation,
    ],
    updatePayment
  )
  .delete(protect, deletePayment);

export default router;
