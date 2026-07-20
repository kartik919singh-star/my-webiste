import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('CRITICAL: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }
    
    // Connect to MongoDB Atlas explicitly targeting marbledb database
    const conn = await mongoose.connect(uri, {
      dbName: 'marbledb'
    });
    console.log(`MongoDB Connected successfully: Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

export default connectDB;
