// Import the async handler utility
const asyncHandler = require('express-async-handler');
// Import the Post model
const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public (Adjust access as needed)
const getPosts = asyncHandler(async (req, res) => {
  console.log('--- ENTERING getPosts controller ---');
  // Fetch all posts, sorted by creation date (newest first)
  // If using ObjectId for author, you might want to populate user details:
  // const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name email'); // Example population
  const posts = await Post.find().sort({ createdAt: -1 });
  console.log(`Post.find() successful, found ${posts.length} posts.`);
  // Send the posts as JSON response
  res.status(200).json(posts);
});

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public (Adjust access as needed)
const getPost = asyncHandler(async (req, res) => {
  // Find the post by ID provided in the request parameters
  const post = await Post.findById(req.params.id);
  // If post is not found, set status to 404 and throw an error
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  // Send the found post as JSON response
  res.status(200).json(post);
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Assuming only logged-in users can post)
const createPost = asyncHandler(async (req, res) => {
  // Destructure title, content, and author from the request body
  const { title, content, author } = req.body;

  // Basic validation: Check if required fields are present
  if (!title || !content || !author) {
    // If validation fails, set status to 400 and throw an error
    res.status(400);
    throw new Error('Please provide title, content, and author');
    // If 'author' is an ObjectId, you'd likely get it from req.user (auth middleware)
    // instead of req.body, and validate its presence.
  }

  // Create a new post using the Post model
  const post = await Post.create({
    title,
    content,
    author, // If author is ObjectId, this should be the user's ID
  });

  // Send the newly created post back with a 201 status code
  res.status(201).json(post);
});

// @desc    Update a post by ID
// @route   PUT /api/posts/:id
// @access  Private (Assuming only the author can update)
const updatePost = asyncHandler(async (req, res) => {
  // Find the post by ID and update it with data from the request body
  // { new: true } returns the updated document
  // { runValidators: true } ensures the update respects schema validation rules
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // If no post was found and updated, set status to 404 and throw an error
  if (!updatedPost) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Send the updated post as JSON response
  res.status(200).json(updatedPost);
  // Note: Add authorization check here - ensure req.user.id matches post.author before updating
});

// @desc    Delete a post by ID
// @route   DELETE /api/posts/:id
// @access  Private (Assuming only the author can delete)
const deletePost = asyncHandler(async (req, res) => {
  // Find the post by ID and delete it
  const deletedPost = await Post.findByIdAndDelete(req.params.id);

  // If no post was found and deleted, set status to 404 and throw an error
  if (!deletedPost) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Send the ID of the deleted post back as confirmation
  res.status(200).json({ id: req.params.id, message: 'Post deleted successfully' });
  // Note: Add authorization check here - ensure req.user.id matches post.author before deleting
});

// @desc    Like a post by ID
// @route   PATCH /api/posts/:id/like  (Using PATCH is common for partial updates like 'like')
// @access  Private (Assuming only logged-in users can like)
const likePost = asyncHandler(async (req, res) => {
  // Find the post by ID and atomically increment the 'likes' count by 1
  // { new: true } returns the updated document
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } }, // Use $inc for atomic increment
    { new: true }
  );

  // If no post was found and updated, set status to 404 and throw an error
  if (!updatedPost) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Send the updated post (with the new like count) as JSON response
  res.status(200).json(updatedPost);
});

// Export all controller functions
module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
};
