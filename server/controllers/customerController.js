import Customer from '../models/Customer.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).sort({ updatedAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Search customers by name or phone
// @route   GET /api/customers/search
// @access  Public
export const searchCustomers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      const customers = await Customer.find({}).sort({ updatedAt: -1 });
      return res.status(200).json(customers);
    }

    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    }).sort({ updatedAt: -1 });

    res.status(200).json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer (or retrieve existing by phone)
// @route   POST /api/customers
// @access  Public
export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    let customer = await Customer.findOne({ phone });
    
    if (customer) {
      if (customer.name !== name || customer.address !== address) {
        customer.name = name;
        customer.address = address;
        await customer.save();
      }
      return res.status(200).json(customer);
    }

    customer = await Customer.create({ name, phone, address });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Public
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      res.status(404);
      throw new Error('Customer record not found');
    }

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Public
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      res.status(404);
      throw new Error('Customer record not found');
    }

    res.status(200).json({ success: true, message: 'Customer record successfully removed' });
  } catch (error) {
    next(error);
  }
};
