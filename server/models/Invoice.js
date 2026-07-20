import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  calculatedSqFt: { type: Number, required: true },
  totalCost: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Invoice must be linked to a customer'],
    },
    items: {
      type: [invoiceItemSchema],
      validate: [
        (val) => val.length > 0,
        'Invoice must contain at least one line item'
      ]
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      required: true,
      min: [0, 'GST tax cannot be negative'],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, 'Grand total cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Paid', 'Unpaid', 'Pending'],
      default: 'Unpaid',
    },
    date: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
