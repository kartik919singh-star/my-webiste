import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

// @desc    Get all payment transactions
// @route   GET /api/payments
// @access  Public
export const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({})
      .populate('customer')
      .populate('invoice')
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a payment and auto-update invoice status to Paid
// @route   POST /api/payments
// @access  Public
export const createPayment = async (req, res, next) => {
  try {
    const { invoice, customer, amount, paymentMethod, status, referenceNumber } = req.body;

    const payment = await Payment.create({
      invoice,
      customer,
      amount: parseFloat(amount) || 0,
      paymentMethod,
      status: status || 'Success',
      referenceNumber,
    });

    // If payment succeeds, update the linked bill's status to 'Paid'
    if (payment.status === 'Success') {
      await Invoice.findByIdAndUpdate(invoice, { status: 'Paid' });
    }

    const populated = await Payment.findById(payment._id)
      .populate('customer')
      .populate('invoice');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Public
export const updatePayment = async (req, res, next) => {
  try {
    const { status, referenceNumber } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    payment.status = status ?? payment.status;
    payment.referenceNumber = referenceNumber ?? payment.referenceNumber;

    const updatedPayment = await payment.save();

    // Sync invoice status if updated to Success
    if (updatedPayment.status === 'Success') {
      await Invoice.findByIdAndUpdate(payment.invoice, { status: 'Paid' });
    }

    const populated = await Payment.findById(updatedPayment._id)
      .populate('customer')
      .populate('invoice');

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a payment record
// @route   DELETE /api/payments/:id
// @access  Public
export const deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    res.status(200).json({ success: true, message: 'Payment record successfully removed' });
  } catch (error) {
    next(error);
  }
};
