import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// @desc    Get all inventory records
// @route   GET /api/inventory
// @access  Public
export const getInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({}).populate('product').sort({ updatedAt: -1 });
    res.status(200).json(inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new inventory entry
// @route   POST /api/inventory
// @access  Public
export const createInventory = async (req, res, next) => {
  try {
    const { product, stockQuantity, minStockLevel, location } = req.body;

    const inventory = await Inventory.create({
      product,
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      minStockLevel: parseInt(minStockLevel, 10) || 10,
      location: location || 'Main Showroom',
    });

    res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory stock counts
// @route   PUT /api/inventory/:id
// @access  Public
export const updateInventory = async (req, res, next) => {
  try {
    const { stockQuantity, minStockLevel, location } = req.body;

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      res.status(404);
      throw new Error('Inventory record not found');
    }

    inventory.stockQuantity = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : inventory.stockQuantity;
    inventory.minStockLevel = minStockLevel !== undefined ? parseInt(minStockLevel, 10) : inventory.minStockLevel;
    inventory.location = location ?? inventory.location;

    const updatedInventory = await inventory.save();

    // Sync product quantity matching this inventory item
    await Product.findByIdAndUpdate(inventory.product, {
      quantity: inventory.stockQuantity,
    });

    const populated = await Inventory.findById(updatedInventory._id).populate('product');
    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory record
// @route   DELETE /api/inventory/:id
// @access  Public
export const deleteInventory = async (req, res, next) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      res.status(404);
      throw new Error('Inventory record not found');
    }

    res.status(200).json({ success: true, message: 'Inventory record removed successfully' });
  } catch (error) {
    next(error);
  }
};
