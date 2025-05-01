// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  // getUserProfile // Import future controllers
} = require('../controllers/userController');

// Import authentication middleware (we'll create this later if needed for protected routes)
// const { protect } = require('../middleware/authMiddleware');

// --- Public Routes ---
// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// --- Protected Routes (Example) ---
// Route for getting the logged-in user's profile
// router.get('/profile', protect, getUserProfile); // Requires authentication

// TODO: Add routes for updating profile, following users, etc.

module.exports = router;
