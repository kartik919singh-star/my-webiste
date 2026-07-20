import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    console.log('[SeedScript] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { dbName: 'marbledb' });
    console.log('[SeedScript] Connected to MongoDB Atlas database: marbledb');

    // Admin Credentials
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hanumant.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'adminpassword';
    const adminName = process.env.SEED_ADMIN_NAME || 'Admin Operator';

    // Employee Credentials
    const employeeEmail = process.env.SEED_EMPLOYEE_EMAIL || 'employee@hanumant.com';
    const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD || 'employeepassword';
    const employeeName = process.env.SEED_EMPLOYEE_NAME || 'Employee Desk Officer';

    // 1. Seed Admin Account
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log(`[SeedScript] Admin user (${adminEmail}) already exists. Updating password & role...`);
      admin.name = adminName;
      admin.password = adminPassword;
      admin.role = 'admin';
      await admin.save();
      console.log(`[SeedScript] Admin user (${adminEmail}) updated successfully!`);
    } else {
      console.log(`[SeedScript] Creating new Admin user (${adminEmail})...`);
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`[SeedScript] Admin user (${adminEmail}) created successfully!`);
    }

    // 2. Seed Employee Account
    let employee = await User.findOne({ email: employeeEmail });
    if (employee) {
      console.log(`[SeedScript] Employee user (${employeeEmail}) already exists. Updating password & role...`);
      employee.name = employeeName;
      employee.password = employeePassword;
      employee.role = 'employee';
      await employee.save();
      console.log(`[SeedScript] Employee user (${employeeEmail}) updated successfully!`);
    } else {
      console.log(`[SeedScript] Creating new Employee user (${employeeEmail})...`);
      employee = await User.create({
        name: employeeName,
        email: employeeEmail,
        password: employeePassword,
        role: 'employee',
      });
      console.log(`[SeedScript] Employee user (${employeeEmail}) created successfully!`);
    }

    const allUsers = await User.find({}).select('-password');
    console.log('[SeedScript] Seeding complete. Registered operators:', JSON.stringify(allUsers, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('[SeedScript] Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
