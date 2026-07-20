import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Marble', 'Granite', 'Tiles'],
      required: [true, 'Product type must be Marble, Granite, or Tiles'],
    },
    length: {
      type: Number,
      required: [true, 'Default length in feet is required'],
      min: [0, 'Length cannot be negative'],
    },
    width: {
      type: Number,
      required: [true, 'Default width in feet is required'],
      min: [0, 'Width cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Initial stock quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price per square-foot is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
