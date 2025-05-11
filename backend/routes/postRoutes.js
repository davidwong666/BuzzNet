// * Good for now

const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  // updatePost,
  deletePost,
  likePost,
  dislikePost,
} = require('../controllers/postController');

// Middleware to protect routes
const { protect } = require('../middleware/authMiddleware');

// GET all posts
router.get('/', getPosts);

// GET single post
router.get('/:id', getPostById);

// POST create post - Apply the protect middleware here
router.post('/', protect, createPost);

// PUT update post - Apply protect if only authenticated users (e.g., author) can update
// router.put('/:id', protect, updatePost); // You'll need to add authorization logic in updatePost

// DELETE post - Apply protect
router.delete('/:id', protect, deletePost);

// PATCH like/dislike post - Apply protect
router.route('/:id/like').patch(protect, likePost);
router.route('/:id/dislike').patch(protect, dislikePost);

module.exports = router;
