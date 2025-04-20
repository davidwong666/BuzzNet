// Special test file for Vercel deployment debugging
const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Basic info
    const result = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      mongo_uri_exists: !!process.env.MONGO_URI,
      mongo_uri_length: process.env.MONGO_URI ? process.env.MONGO_URI.length : 0
    };
    
    // Attempt connection with direct MongoClient (not mongoose)
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/buzznet';
    console.log('Attempting connection with direct MongoClient');
    
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000
    });
    
    console.log('Connecting...');
    await client.connect();
    console.log('Connected successfully');
    
    // Get database info
    const db = client.db();
    result.connection = 'successful';
    result.database_name = db.databaseName;
    
    // Count collections
    const collections = await db.listCollections().toArray();
    result.collections = collections.map(c => c.name);
    result.collection_count = collections.length;
    
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