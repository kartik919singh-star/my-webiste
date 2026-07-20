import express from 'express';
import { check } from 'express-validator';
import {
  getProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { handleValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/search', searchProducts);

router.route('/')
  .get(getProducts)
  .post(
    protect,
    admin,
    [
      check('name', 'Product name is required').notEmpty().trim(),
      check('type', 'Product type must be Marble, Granite, or Tiles').isIn(['Marble', 'Granite', 'Tiles']),
      check('price', 'Product price per sqft must be a positive number').isFloat({ min: 0 }),
      check('quantity', 'Initial stock quantity must be a positive integer').isInt({ min: 0 }),
      handleValidation,
    ],
    createProduct
  );

router.route('/:id')
  .put(
    protect,
    admin,
    [
      check('name', 'Product name cannot be blank').optional().notEmpty().trim(),
      check('type', 'Product type must be Marble, Granite, or Tiles').optional().isIn(['Marble', 'Granite', 'Tiles']),
      check('price', 'Product price must be a positive number').optional().isFloat({ min: 0 }),
      check('quantity', 'Stock quantity must be a positive integer').optional().isInt({ min: 0 }),
      handleValidation,
    ],
    updateProduct
  )
  .delete(protect, admin, deleteProduct);

export default router;
