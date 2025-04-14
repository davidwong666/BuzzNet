// MongoDB connection test for Vercel serverless
const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Set CORS headers for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Basic info
    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      mongo_uri_exists: !!process.env.MONGO_URI,
      mongo_uri_length: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0
    };
    
    // Attempt direct connection to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/buzznet';
    
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    
    await client.connect();
    
    // Get database info
    const db = client.db();
    result.connection = 'successful';
    result.database_name = db.databaseName;
    
    // Create a test document
    const collection = db.collection('test_collection');
    const testDoc = { 
      message: 'Test document', 
      created_at: new Date() 
    };
    
    // Insert the test document
    const insertResult = await collection.insertOne(testDoc);
    result.document_inserted = insertResult.acknowledged;
    result.document_id = insertResult.insertedId.toString();
    
    // Close connection
    await client.close();
    result.connection_closed = true;
    
    // Return successful result
    res.status(200).json(result);
  } catch (error) {
    // Return error information
    res.status(500).json({
      error: true,
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString()
    });
  }
}; 