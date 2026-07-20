import express from 'express';
import { check } from 'express-validator';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getInventory)
  .post(
    protect,
    [
      check('product', 'Valid Product database ID reference is required').isMongoId(),
      check('stockQuantity', 'Initial stock level must be a positive integer').isInt({ min: 0 }),
      handleValidation,
    ],
    createInventory
  );

router.route('/:id')
  .put(
    protect,
    [
      check('stockQuantity', 'Stock level must be a positive integer').optional().isInt({ min: 0 }),
      handleValidation,
    ],
    updateInventory
  )
  .delete(protect, deleteInventory);

export default router;
