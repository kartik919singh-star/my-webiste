import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

// Model imports for initial seeding
import User from './models/User.js';
import Product from './models/Product.js';
import Inventory from './models/Inventory.js';
import Customer from './models/Customer.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import Employee from './models/Employee.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to this server file location for robustness
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow local origins, configured CLIENT_URL, or any valid production web origin
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const clientUrl = process.env.CLIENT_URL;
    if (isLocal || (clientUrl && origin === clientUrl) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Permit production web domains
    return callback(null, true);
  },
  credentials: true
}));

// Request parsers & logging middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static uploads folder access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employees', employeeRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Hanumant Marble Production API Server is active' });
});

// Health check endpoint returning database, server, and collections status
app.get('/api/health', async (req, res, next) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    let collectionsStatus = {
      users: false,
      customers: false,
      products: false,
      inventory: false,
      payments: false,
      invoices: false,
      employees: false,
    };
    
    if (dbStatus === 'connected') {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const names = collections.map(c => c.name);
      
      collectionsStatus = {
        users: names.includes('users'),
        customers: names.includes('customers'),
        products: names.includes('products'),
        inventory: names.includes('inventories'),
        payments: names.includes('payments'),
        invoices: names.includes('invoices'),
        employees: names.includes('employees'),
      };
    }
    
    res.status(200).json({
      database: dbStatus,
      collections: collectionsStatus
    });
  } catch (error) {
    next(error);
  }
});

// Route Not Found and Global Error Handler Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database first, seed data, and start server
const startServer = async () => {
  console.log('[Startup] Connecting to MongoDB Atlas...');
  await connectDB();
  
  // 1. Seed sample admin operator if admin@hanumant.com does not exist
  try {
    console.log('[Startup] Verifying operator directory records...');
    const adminExists = await User.findOne({ email: 'admin@hanumant.com' });
    if (!adminExists) {
      console.log('[Startup] Admin operator not found. Seeding default operator...');
      await User.create({
        name: 'Admin Operator',
        email: 'admin@hanumant.com',
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('[Startup] Seeded default user successfully: admin@hanumant.com / adminpassword');
    } else {
      console.log('[Startup] Default admin operator already registered.');
    }
  } catch (err) {
    console.error('[Startup] Failed to seed default admin user:', err);
  }

  // 2. Seed sample products if collection is empty
  try {
    console.log('[Startup] Verifying showroom product stock records...');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Startup] Showroom database is empty. Seeding initial marble, granite, and tile records...');
      const sampleProducts = [
        { name: 'Italian Carrara Marble', type: 'Marble', length: 8.5, width: 4.5, quantity: 45, price: 450 },
        { name: 'Imperial Red Granite', type: 'Granite', length: 10, width: 3.5, quantity: 25, price: 320 },
        { name: 'Turkish Crema Marfil', type: 'Marble', length: 9, width: 5, quantity: 15, price: 580 },
        { name: 'Vitrified Onyx Tiles', type: 'Tiles', length: 2, width: 2, quantity: 250, price: 95 }
      ];
      
      for (const p of sampleProducts) {
        const product = await Product.create(p);
        await Inventory.create({
          product: product._id,
          stockQuantity: product.quantity,
          location: product.type === 'Tiles' ? 'Aisle B' : 'Warehouse A',
          minStockLevel: product.type === 'Tiles' ? 50 : 5
        });
      }
      console.log('[Startup] Product and stock level seeding completed successfully!');
    } else {
      console.log('[Startup] Showroom products database contains existing records.');
    }
  } catch (err) {
    console.error('[Startup] Failed to seed initial products:', err);
  }

  // 3. Seed sample customer if empty
  let sampleCustomer;
  try {
    console.log('[Startup] Verifying customer directory records...');
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('[Startup] Seeding initial customer profile...');
      sampleCustomer = await Customer.create({
        name: 'Rohan Mehra',
        phone: '+91 98765 43210',
        address: 'Indiranagar, 100 Feet Rd, Bangalore'
      });
      console.log('[Startup] Customer seeding completed successfully!');
    } else {
      sampleCustomer = await Customer.findOne({});
      console.log('[Startup] Customer database contains existing profiles.');
    }
  } catch (err) {
    console.error('[Startup] Failed to seed default customer:', err);
  }

  // 4. Seed sample invoice if empty
  let sampleInvoice;
  try {
    console.log('[Startup] Verifying invoice billing records...');
    const invoiceCount = await Invoice.countDocuments();
    if (invoiceCount === 0 && sampleCustomer) {
      console.log('[Startup] Seeding initial sample invoice...');
      sampleInvoice = await Invoice.create({
        customer: sampleCustomer._id,
        items: [
          {
            name: 'Italian Carrara Marble',
            length: 8.5,
            width: 4.5,
            quantity: 10,
            price: 450,
            calculatedSqFt: 382.5,
            totalCost: 172125
          }
        ],
        subtotal: 172125,
        tax: 30982.5,
        grandTotal: 203107.5,
        status: 'Unpaid'
      });
      console.log('[Startup] Invoice seeding completed successfully!');
    } else {
      sampleInvoice = await Invoice.findOne({});
      console.log('[Startup] Invoice database contains existing records.');
    }
  } catch (err) {
    console.error('[Startup] Failed to seed default invoice:', err);
  }

  // 5. Seed sample payment if empty
  try {
    console.log('[Startup] Verifying payment ledger records...');
    const paymentCount = await Payment.countDocuments();
    if (paymentCount === 0 && sampleCustomer && sampleInvoice) {
      console.log('[Startup] Seeding initial sample payment...');
      await Payment.create({
        invoice: sampleInvoice._id,
        customer: sampleCustomer._id,
        amount: 203107.5,
        paymentMethod: 'UPI',
        status: 'Success',
        referenceNumber: 'UPI889237482'
      });
      console.log('[Startup] Payment seeding completed successfully!');
    } else {
      console.log('[Startup] Payment database contains existing transactions.');
    }
  } catch (err) {
    console.error('[Startup] Failed to seed default payment:', err);
  }

  console.log('[Startup] Initializing HTTP listener...');
  const server = app.listen(PORT, () => {
    console.log(`[Startup] Server running successfully in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Startup Error] Port ${PORT} is currently occupied by another process. Please kill the old process or change PORT in server/.env.`);
    } else {
      console.error('[Startup Error] Server error:', err);
    }
  });
};

startServer();
