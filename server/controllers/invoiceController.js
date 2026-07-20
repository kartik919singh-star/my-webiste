import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// @desc    Get all invoices
// @route   GET /api/bills
// @access  Public
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({}).populate('customer').sort({ date: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Search invoices by ID or customer name
// @route   GET /api/bills/search
// @access  Public
export const searchInvoices = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      const invoices = await Invoice.find({}).populate('customer').sort({ date: -1 });
      return res.status(200).json(invoices);
    }

    let filter = {};

    // Check if query is a valid 24-character hexadecimal ObjectId
    if (query.match(/^[0-9a-fA-F]{24}$/)) {
      filter = { _id: query };
    } else {
      // Find matching customers first
      const customers = await Customer.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
        ],
      });
      const customerIds = customers.map((c) => c._id);
      filter = { customer: { $in: customerIds } };
    }

    const invoices = await Invoice.find(filter).populate('customer').sort({ date: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new invoice and deduct stock
// @route   POST /api/bills
// @access  Public
export const createInvoice = async (req, res, next) => {
  try {
    console.log('[Invoice Controller] Incoming createInvoice payload received:', JSON.stringify(req.body, null, 2));
    
    const { customer: customerData, items, subtotal, tax, grandTotal, status } = req.body;

    if (!customerData || !customerData.name || !customerData.phone) {
      console.warn('[Invoice Controller] Missing required customer parameters.');
      res.status(400);
      throw new Error('Customer name and phone number are required');
    }

    if (!items || items.length === 0) {
      console.warn('[Invoice Controller] Empty items listing. Aborting save.');
      res.status(400);
      throw new Error('Invoice must contain at least one product item');
    }

    // 1. Find or create Customer record
    console.log('[Invoice Controller] Matching customer by phone:', customerData.phone);
    let customer = await Customer.findOne({ phone: customerData.phone });
    if (!customer) {
      customer = await Customer.create({
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address || 'Address not provided',
      });
      console.log('[Invoice Controller] New customer registered successfully. Customer ID:', customer._id);
    } else {
      // Sync address/name changes if any
      if (customer.name !== customerData.name || (customerData.address && customer.address !== customerData.address)) {
        customer.name = customerData.name;
        if (customerData.address) customer.address = customerData.address;
        await customer.save();
        console.log('[Invoice Controller] Customer profile attributes updated. Customer ID:', customer._id);
      } else {
        console.log('[Invoice Controller] Existing customer profile matched. Customer ID:', customer._id);
      }
    }

    // 2. Parse items and compute total quantities
    const parsedItems = items.map((item) => {
      const len = parseFloat(item.length) || 0;
      const wid = parseFloat(item.width) || 0;
      const qty = parseInt(item.quantity, 10) || 0;
      const prc = parseFloat(item.price) || 0;
      const sqFt = len * wid * qty;
      const totalCost = sqFt * prc;
      return {
        name: item.name,
        length: len,
        width: wid,
        quantity: qty,
        price: prc,
        calculatedSqFt: sqFt,
        totalCost: totalCost,
      };
    });
    console.log('[Invoice Controller] Grid items parsed successfully:', parsedItems);

    // 3. Create the Invoice record
    if (process.env.DEBUG) {
      const countBefore = await Invoice.countDocuments();
      console.log(`[DEBUG] Total invoices in collection BEFORE save: ${countBefore}`);
    }

    const invoice = await Invoice.create({
      customer: customer._id,
      items: parsedItems,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      grandTotal: parseFloat(grandTotal) || 0,
      status: status || 'Unpaid',
    });

    if (process.env.DEBUG) {
      const countAfter = await Invoice.countDocuments();
      console.log(`[DEBUG] Total invoices in collection AFTER save: ${countAfter}`);
      console.log(`[DEBUG] Resulting Invoice _id: ${invoice._id}`);
    }

    // 4. Deduct stock quantities from products and inventory
    for (const item of parsedItems) {
      const product = await Product.findOne({
        name: { $regex: new RegExp('^' + item.name + '$', 'i') },
      });

      if (product) {
        const previousQty = product.quantity;
        product.quantity = Math.max(0, product.quantity - item.quantity);
        await product.save();
        console.log(`[Invoice Controller] Subtracted product stock for "${product.name}". Previous: ${previousQty}, New: ${product.quantity}`);

        await Inventory.findOneAndUpdate(
          { product: product._id },
          { stockQuantity: product.quantity },
          { upsert: true }
        );
        console.log(`[Invoice Controller] Synchronized stock tracking record inside inventories collection.`);
      } else {
        console.log(`[Invoice Controller] Product "${item.name}" was entered dynamically (not in catalog). Skipping stock deductions.`);
      }
    }

    const populatedInvoice = await Invoice.findById(invoice._id).populate('customer');
    console.log('[Invoice Controller] Populated Invoice payload returned:', JSON.stringify(populatedInvoice, null, 2));
    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('[Invoice Controller] Error occurred during invoice compilation:', error);
    next(error);
  }
};

// @desc    Update invoice status/details
// @route   PUT /api/bills/:id
// @access  Public
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customer');

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice record
// @route   DELETE /api/bills/:id
// @access  Public
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error('Invoice not found');
    }

    res.status(200).json({ success: true, message: 'Invoice record removed' });
  } catch (error) {
    next(error);
  }
};
