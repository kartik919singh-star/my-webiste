import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../server/.env') });

import mongoose from 'mongoose';
import connectDB from '../server/config/db.js';
import User from '../server/models/User.js';
import Customer from '../server/models/Customer.js';
import Invoice from '../server/models/Invoice.js';

const checkReadonlyCounts = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    const customerCount = await Customer.countDocuments();
    const invoiceCount = await Invoice.countDocuments();

    console.log('\n--- READONLY DB AUDIT RESULTS ---');
    console.log(`User collection count    : ${userCount}`);
    console.log(`Customer collection count: ${customerCount}`);
    console.log(`Invoice collection count : ${invoiceCount}`);

    const users = await User.find({}).select('email role name createdAt');
    console.log('Registered User Accounts:', JSON.stringify(users, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[READONLY DB AUDIT ERROR]:', err);
    process.exit(1);
  }
};

checkReadonlyCounts();
