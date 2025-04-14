const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  // Get the connection string
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/buzznet';
  console.log(`Connection string exists: ${!!mongoURI}`);
  console.log(`Connection string length: ${mongoURI.length}`);
  console.log(`Connection string starts with: ${mongoURI.substring(0, 20)}...`);
  
  try {
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    console.log('Attempting to connect...');
    const conn = await mongoose.connect(mongoURI, options);
    console.log('CONNECTION SUCCESSFUL!');
    console.log(`Connected to MongoDB at: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    
    // Try to access a collection
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    return true;
  } catch (error) {
    console.error('CONNECTION ERROR:');
    console.error(`Error type: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log(`Test completed with ${success ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 