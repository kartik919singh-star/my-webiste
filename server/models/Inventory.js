import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Inventory entry must refer to a product'],
      unique: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    location: {
      type: String,
      default: 'Main Showroom',
      trim: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update lastUpdated date
inventorySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
