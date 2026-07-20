import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Employee phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Employee email address is required'],
      lowercase: true,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Job designation is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: String,
      default: 'Address not provided',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Resigned'],
      default: 'Active',
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
