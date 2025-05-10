const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  // TODO: populate author field instead of just returning the ObjectId
  // Fetch all posts, sorted by creation date (newest first)
  const posts = await Post.find()
  .sort({ createdAt: -1 })
  .populate('author', 'username');
  console.log(`Post.find() successful, found ${posts.length} posts.`);
  // Send the posts as JSON response
  res.status(200).json(posts);
});

// // @desc    Get single post by ID
// // @route   GET /api/posts/:id
// // @access  Public (Adjust access as needed)
// const getPost = asyncHandler(async (req, res) => {
//   // Find the post by ID provided in the request parameters
//   const post = await Post.findById(req.params.id);
//   // If post is not found, set status to 404 and throw an error
//   if (!post) {
//     res.status(404);
//     throw new Error('Post not found');
//   }
//   // Send the found post as JSON response
//   res.status(200).json(post);
// });

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (Assuming only logged-in users can post)
const createPost = asyncHandler(async (req, res) => {
  // Destructure only title and content from the request body.
  // The author comes from the authenticated user (req.user).
  const { title, content } = req.body;

  // Basic validation: Check if required fields from the body are present.
  if (!title || !content) {
    // If validation fails, set status to 400 (Bad Request).
    res.status(400);
    // Throw an error indicating missing fields.
    throw new Error('Please provide both title and content for the post.');
  }

  // --- Get Author ID from Authenticated User ---
  // Authentication middleware should have added the user object to req.user.
  // We need the user's MongoDB ObjectId (_id).
  if (!req.user || !req.user._id) {
    // If authentication middleware failed or didn't attach user info, deny access.
    res.status(401); // Unauthorized
    throw new Error('User not authenticated or user ID not found.');
    // This check is a safeguard; ideally, the auth middleware prevents unauthenticated access entirely.
  }

  // Verify the user actually exists in the DB, although the ID
  // coming from a trusted auth token should be valid.
  const userExists = await User.findById(req.user._id);
  if (!userExists) {
    res.status(401);
    throw new Error('Author user not found in database.');
  }

  // Create a new post using the Post model.
  // Pass the extracted title, content, and the author's ObjectId.
  const post = await Post.create({
    title,
    content,
    author: req.user._id, // Use the user's ObjectId
    // 'likes' will default to 0 based on the schema
    // 'timestamps' will be added automatically based on the schema
  });

  // If the post was created successfully:
  // Send the newly created post back as JSON with a 201 (Created) status code.
  res.status(201).json(post);

  // Note: The asyncHandler wrapper handles catching errors from async functions
  // and passing them to your Express error handling middleware.
});

// @desc    Update a post by ID
// @route   PUT /api/posts/:id
// @access  Private (Assuming only the author can update)
// const updatePost = asyncHandler(async (req, res) => {
//   const post = await Post.findById(req.params.id); // Fetch post first to check author

//   if (!post) {
//     res.status(404);
//     throw new Error('Post not found');
//   }

//   // Authorization Check: Ensure logged-in user's name matches the post's author name
//   if (post.author !== req.user.name) {
//     res.status(403); // Forbidden
//     throw new Error('You are not authorized to update this post');
//   }

//   // If authorized, then update:
//   const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   // Send the updated post as JSON response
//   res.status(200).json(updatedPost);
// });

// @desc    Delete a post by ID
// @route   DELETE /api/posts/:id
// @access  Private (Only the author can delete)
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params; // Post ID from the URL
  const userId = req.user._id; // Authenticated user's ID from the `protect` middleware

  // Find the post by ID
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Authorization Check: Compare author's ObjectId with authenticated user's ID
  if (post.author.toString() !== userId.toString()) {
    res.status(403); // Forbidden
    throw new Error('You are not authorized to delete this post');
  }

  await post.deleteOne();

  res.status(200).json({ id: post._id, message: 'Post deleted successfully' });
});

// @desc    Like a post by ID
// @route   PATCH /api/posts/:id/like  (Using PATCH is common for partial updates like 'like')
// @access  Private (Assuming only logged-in users can like)
// const likePost = async (req, res) => {
//   const { id } = req.params; // Post ID from the URL
//   const userId = req.user.id; // User ID from the authenticated user (e.g., from JWT)

//   try {
//     // Find the post by ID
//     const post = await Post.findById(id);

//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Check if the user has already liked the post
//     if (post.likedBy.includes(userId)) {
//       return res.status(400).json({ message: 'You have already liked this post' });
//     }

//     // Add the user's ID to the likedBy array and increment the likes count
//     post.likedBy.push(userId);
//     post.likes += 1;

//     // Save the updated post
//     await post.save();

//     res.status(200).json({ message: 'Post liked successfully', post });
//   } catch (error) {
//     console.error('Error liking post:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// const unlikePost = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {
//     const post = await Post.findById(id);

//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Check if the user has liked the post
//     if (!post.likedBy.includes(userId)) {
//       return res.status(400).json({ message: 'You have not liked this post' });
//     }

//     // Remove the user's ID from the likedBy array and decrement the likes count
//     post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
//     post.likes -= 1;

//     await post.save();

//     res.status(200).json({ message: 'Post unliked successfully', post });
//   } catch (error) {
//     console.error('Error unliking post:', error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// Export all controller functions
module.exports = {
  getPosts,
  // getPost,
  createPost,
  // updatePost,
  deletePost,
  // likePost,
  // unlikePost,
};
