const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  dislikePost,
  addComment,
  likeComment,
  dislikeComment,
} = require('../controllers/postController');

// GET all posts
router.route('/').get(getPosts);

// GET single post
router.route('/:id').get(getPostById).delete(protect, deletePost);

// POST create post - Apply the protect middleware here
router.route('/').post(protect, createPost);

// PATCH like/dislike post - Apply protect
router.route('/:id/like').patch(protect, likePost);

router.route('/:id/dislike').patch(protect, dislikePost);

// Add a comment to a post
router.route('/:id/comments').post(protect, addComment);

// Like/dislike a comment
router.route('/:id/comments/:commentId/like').patch(protect, likeComment);

router.route('/:id/comments/:commentId/dislike').patch(protect, dislikeComment);

module.exports = router;
