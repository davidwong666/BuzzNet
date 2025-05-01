const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/postController');

// GET all posts
router.get('/', getPosts);

// GET single post
router.get('/:id', getPost);

// POST create post
router.post('/', createPost);

// PUT update post
router.put('/:id', updatePost);

// DELETE post
router.delete('/:id', deletePost);

// PATCH like post
router.patch('/:id/like', likePost);

module.exports = router;
