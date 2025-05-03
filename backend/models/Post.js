const mongoose = require('mongoose');

// Optional: Define a schema for comments if embedding them directly
const commentSchema = new mongoose.Schema(
  {
    // Reference to the user who made the comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    // The text content of the comment
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
    },
    // Optional: User's name at the time of commenting (denormalized for convenience)
    name: {
      type: String,
      required: true,
    },
    // TODO: User's profile picture URL at the time of commenting
    // profilePicture: {
    //   type: String
    // }
  },
  {
    // Add timestamps (createdAt, updatedAt) to each comment
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    // Title of the post
    title: {
      type: String,
      required: [true, 'Please provide a post title'],
      trim: true, // Remove leading/trailing whitespace
    },
    // Main content/body of the post
    content: {
      type: String,
      required: [true, 'Please provide post content'],
    },
    // Reference to the User who created the post
    author: {
      type: mongoose.Schema.Types.ObjectId, // Store the User's ID
      ref: 'User', // Establish a reference to the 'User' model
      required: [true, 'Post must have an author'],
      index: true, // Add an index for faster queries filtering by author
    },
    // Number of likes the post has received
    likes: {
      type: Number,
      default: 0, // Start with 0 likes
      min: 0, // Likes cannot be negative
    },
    // Optional: Array to store users who liked the post (ensure only like once)
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Array of embedded comment subdocuments
    comments: [commentSchema], // Use the commentSchema defined above
    // Optional: URL for an image associated with the post
    // imageUrl: {
    //   type: String,
    //   default: ''
    // }
  },
  {
    // Schema Options:
    // Automatically add 'createdAt' and 'updatedAt' timestamp fields to the post
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
