import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ updatedAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Search products by name
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      const products = await Product.find({}).sort({ updatedAt: -1 });
      return res.status(200).json(products);
    }

    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
    }).sort({ updatedAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product and auto-create inventory entry
// @route   POST /api/products
// @access  Public
export const createProduct = async (req, res, next) => {
  try {
    const { name, type, length, width, quantity, price } = req.body;

    const product = await Product.create({
      name,
      type,
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      quantity: parseInt(quantity, 10) || 0,
      price: parseFloat(price) || 0,
    });

    // Auto-create associated inventory tracking
    await Inventory.create({
      product: product._id,
      stockQuantity: product.quantity,
      location: type === 'Tiles' ? 'Tile Aisle' : 'Marble Warehouse',
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update product details and sync inventory
// @route   PUT /api/products/:id
// @access  Public
export const updateProduct = async (req, res, next) => {
  try {
    const { name, type, length, width, quantity, price } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.name = name ?? product.name;
    product.type = type ?? product.type;
    product.length = length !== undefined ? parseFloat(length) : product.length;
    product.width = width !== undefined ? parseFloat(width) : product.width;
    product.quantity = quantity !== undefined ? parseInt(quantity, 10) : product.quantity;
    product.price = price !== undefined ? parseFloat(price) : product.price;

    const updatedProduct = await product.save();

    // Sync inventory stock count
    await Inventory.findOneAndUpdate(
      { product: product._id },
      { stockQuantity: product.quantity },
      { upsert: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product and associated inventory tracking
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Delete inventory tracking record
    await Inventory.deleteOne({ product: product._id });

    res.status(200).json({ success: true, message: 'Product and inventory records removed' });
  } catch (error) {
    next(error);
  }
};
