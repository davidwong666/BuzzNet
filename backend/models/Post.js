// * Good for now

const mongoose = require('mongoose');

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
    // Optional: Denormalized user's name for quicker display if needed
    // name: {
    //   type: String,
    //   required: true,
    // },
    // Optional: Denormalized user's profile picture URL
    // profilePicture: {
    //   type: String,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference the User model
      required: [true, 'Post must have an author'],
      index: true, // Index for faster queries by author
    },
    // Number of likes the post has received
    likes: {
      type: Number,
      default: 0, // Start with 0 likes
      min: 0, // Likes cannot be negative
    },
    // Array of user IDs who liked the post
    // Used for toggling likes and checking if a user has liked a post
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Array of embedded comment documents
    comments: [commentSchema], // Embed the commentSchema here
    // Denormalized count of comments for quick retrieval
    commentCount: {
      type: Number,
      default: 0, // Start with 0 comments
      min: 0, // Comment count cannot be negative
    },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' timestamp fields to the post
    timestamps: true,
  }
);

module.exports = mongoose.model('Post', postSchema);
