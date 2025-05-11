const express = require('express');
const router = express.Router();

// --- Import Controller Functions ---
// Import functions for user registration, login, and potentially fetching user profiles
const {
  registerUser,
  loginUser,
  getUserProfile,
  // updateUserProfile, // Example for a future protected route
} = require('../controllers/userController'); // Adjust path if needed

// --- Import Authentication Middleware ---
// Import the 'protect' middleware to secure routes
const { protect } = require('../middleware/authMiddleware'); // Adjust path if needed

// =========================================
// --- PUBLIC ROUTES ---
// (No authentication required)
// =========================================

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', registerUser);

// @desc    Authenticate a user (login)
// @route   POST /api/users/login
// @access  Public
router.post('/login', loginUser);

// =========================================
// --- PROTECTED ROUTES ---
// (Authentication required - User must be logged in)
// =========================================

// @desc    Get user profile (of the logged-in user)
// @route   GET /api/users/profile
// @access  Private (requires token)
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile (of the logged-in user)
// @route   PUT /api/users/profile
// @access  Private (requires token)
// Example:
// router.put('/profile', protect, updateUserProfile); // You would need to create updateUserProfile controller

// You could add other protected routes here, for example:
// - Change password
// - Delete account
// - Get user's posts, etc.

module.exports = router;
