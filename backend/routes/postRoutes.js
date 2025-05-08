// * Good for now

const express = require('express');
const router = express.Router();
const {
  getPosts,
  // getPost,
  createPost,
  // updatePost,
  // deletePost,
  // likePost,
  // unlikePost,
} = require('../controllers/postController');

// Middleware to protect routes
const { protect } = require('../middleware/authMiddleware');

// GET all posts
router.get('/', getPosts);

// GET single post
// router.get('/:id', getPost);

// POST create post - Apply the protect middleware here
router.post('/', protect, createPost);

// PUT update post - Apply protect if only authenticated users (e.g., author) can update
// router.put('/:id', protect, updatePost); // You'll need to add authorization logic in updatePost

// DELETE post - Apply protect
// router.delete('/:id', protect, deletePost);

// PATCH like post - Apply protect
// router.patch('/:id/like', protect, likePost);

// PATCH unlike post - Apply protect
// router.patch('/:id/unlike', protect, unlikePost);

module.exports = router;
