const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  // Fetch all posts, sorted by creation date (newest first)
  // Populate author field with username and include comments
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('author', 'username')
    .populate('comments.author', 'username');
  
  console.log(`Post.find() successful, found ${posts.length} posts.`);
  // Send the posts as JSON response
  res.status(200).json(posts);
});

// TODO: get single post by ID, for getting access for Post View
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

// TODO: implement updatePost function
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
// @access  Private (Only the author or admin can delete)
const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params; // Post ID from the URL
  const userId = req.user._id; // Authenticated user's ID from the `protect` middleware

  // Find the post by ID
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Authorization Check: Allow deletion if user is admin or the post author
  if (req.user.role !== 'admin' && post.author.toString() !== userId.toString()) {
    res.status(403); // Forbidden
    throw new Error('You are not authorized to delete this post');
  }

  await post.deleteOne();

  res.status(200).json({ id: post._id, message: 'Post deleted successfully' });
});

// @desc    Like a post by ID
// @route   PATCH /api/posts/:id/like  (Using PATCH is common for partial updates like 'like')
// @access  Private (Assuming only logged-in users can like)
const likePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params; // Post ID from the URL
  const userId = req.user._id; // User ID from the authenticated user

  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated.');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Convert userId to string for comparison if it's an ObjectId
  const userIdStr = userId.toString();

  // Check if user is in dislikedBy array and remove them if so
  const userDislikeIndex = post.dislikedBy.findIndex(
    (dislikerId) => dislikerId.toString() === userIdStr
  );
  if (userDislikeIndex > -1) {
    post.dislikedBy.splice(userDislikeIndex, 1);
  }

  // Check if the user has already liked the post
  const userLikeIndex = post.likedBy.findIndex((likerId) => likerId.toString() === userIdStr);

  if (userLikeIndex > -1) {
    // User has already liked the post, so unlike it
    post.likedBy.splice(userLikeIndex, 1);
  } else {
    // User has not liked the post, so like it
    post.likedBy.push(userId);
  }

  // Update likes and dislikes counts
  post.likes = post.likedBy.length;
  post.dislikes = post.dislikedBy.length;

  const updatedPost = await post.save();

  // Populate author details for the response, similar to getPosts
  await updatedPost.populate('author', 'username');

  res.status(200).json(updatedPost);
});

// @desc    Dislike a post by ID
// @route   PATCH /api/posts/:id/dislike
// @access  Private (Assuming only logged-in users can dislike)
const dislikePost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params; // Post ID from the URL
  const userId = req.user._id; // User ID from the authenticated user

  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated.');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Convert userId to string for comparison if it's an ObjectId
  const userIdStr = userId.toString();

  // Check if user is in likedBy array and remove them if so
  const userLikeIndex = post.likedBy.findIndex(
    (likerId) => likerId.toString() === userIdStr
  );
  if (userLikeIndex > -1) {
    post.likedBy.splice(userLikeIndex, 1);
  }

  // Check if the user has already disliked the post
  const userDislikeIndex = post.dislikedBy.findIndex(
    (dislikerId) => dislikerId.toString() === userIdStr
  );

  if (userDislikeIndex > -1) {
    // User has already disliked the post, so remove dislike
    post.dislikedBy.splice(userDislikeIndex, 1);
  } else {
    // User has not disliked the post, so add dislike
    post.dislikedBy.push(userId);
  }

  // Update likes and dislikes counts
  post.likes = post.likedBy.length;
  post.dislikes = post.dislikedBy.length;

  const updatedPost = await post.save();

  // Populate author details for the response
  await updatedPost.populate('author', 'username');

  res.status(200).json(updatedPost);
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username')
    .populate('likedBy', '_id')
    .populate('dislikedBy', '_id');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.status(200).json(post);
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;
  const username = req.user.username;

  if (!text) {
    res.status(400);
    throw new Error('Please provide comment text');
  }

  const post = await Post.findById(id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.comments.push({
    text,
    author: userId,
    username,
    likes: [],
    dislikes: []
  });

  await post.save();
  await post.populate('author', 'username');
  await post.populate('comments.author', 'username');

  res.status(201).json(post);
});

// @desc    Like a comment
// @route   PATCH /api/posts/:id/comments/:commentId/like
// @access  Private
const likeComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const likeIndex = comment.likes.indexOf(userId);
  const dislikeIndex = comment.dislikes.indexOf(userId);

  if (likeIndex > -1) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(userId);
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }
  }

  await post.save();
  await post.populate('author', 'username');
  await post.populate('comments.author', 'username');

  res.status(200).json(post);
});

// @desc    Dislike a comment
// @route   PATCH /api/posts/:id/comments/:commentId/dislike
// @access  Private
const dislikeComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const dislikeIndex = comment.dislikes.indexOf(userId);
  const likeIndex = comment.likes.indexOf(userId);

  if (dislikeIndex > -1) {
    comment.dislikes.splice(dislikeIndex, 1);
  } else {
    comment.dislikes.push(userId);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    }
  }

  await post.save();
  await post.populate('author', 'username');
  await post.populate('comments.author', 'username');

  res.status(200).json(post);
});

// Export all controller functions
module.exports = {
  getPosts,
  getPostById,
  createPost,
  // updatePost,
  deletePost,
  likePost,
  dislikePost,
  addComment,
  likeComment,
  dislikeComment,
};
