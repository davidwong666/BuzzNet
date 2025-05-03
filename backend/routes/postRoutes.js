const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require('../controllers/postController');

// Middleware to protect routes
// To Do
// const { protect } = require('../middleware/authMiddleware');

// GET all posts
router.get('/', getPosts);

// GET single post
router.get('/:id', getPost);

// POST create post
router.post('/', createPost);
// To Do
// router.post('/', protect, createPost);

// PUT update post
router.put('/:id', updatePost);

// DELETE post
router.delete('/:id', deletePost);
// To Do
// router.delete('/:id', protect, deletePost);

// PATCH like post
router.patch('/:id/like', likePost);
// To Do
// router.patch('/:id/like', protect, likePost);

// PATCH unlike post
router.patch('/:id/unlike', unlikePost);
// To Do
// router.patch('/:id/unlike', protect, unlikePost);

module.exports = router;
