// Simplified Express API for Vercel
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/buzznet';
let cachedDb = null;

// Function to connect to MongoDB
async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached DB connection');
    return cachedDb;
  }

  try {
    await client.connect();
    console.log('MongoDB client connected.');
    const db = client.db('buzznet'); // Make sure 'buzznet' is the correct DB name
    console.log(`Connected to database: ${db.databaseName}`);
    cachedDb = { client, db };
    return cachedDb;
  } catch (connectionError) {
    console.error('!!! FAILED TO CONNECT TO MONGODB:', connectionError); // Log connection errors specifically
    // Important: Re-throw the error so the calling function's catch block can handle it
    throw connectionError;
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Root Endpoint: BuzzNet API is running' });
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  console.log(`--- Received GET /api/posts request at ${new Date().toISOString()} ---`);
  try {
    const { db } = await connectToDatabase();
    console.log('Database connection obtained for /api/posts');
    const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${posts.length} posts.`);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts in /api/posts handler:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const { db } = await connectToDatabase();
    const newPost = {
      title,
      content,
      author,
      likes: 0,
      createdAt: new Date(),
    };

    const result = await db.collection('posts').insertOne(newPost);
    const createdPost = await db.collection('posts').findOne({ _id: result.insertedId });

    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Like a post
app.patch('/api/posts/:id/like', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const post = await db
      .collection('posts')
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $inc: { likes: 1 } },
        { returnDocument: 'after' }
      );

    if (!post.value) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post.value);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint for MongoDB connection
app.get('/api/debug/db', async (req, res) => {
  try {
    const { client, db } = await connectToDatabase();
    const collections = await db.listCollections().toArray();

    // Create a test document
    const testCollection = db.collection('test_collection');
    const testDoc = { message: 'Test document', timestamp: new Date() };
    await testCollection.insertOne(testDoc);

    res.json({
      connection: 'successful',
      database: db.databaseName,
      collections: collections.map((c) => c.name),
      test_document_created: true,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    res.status(500).json({
      error: true,
      message: error.message,
      name: error.name,
    });
  }
});

// Export the Express API
module.exports = app;
