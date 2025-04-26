// backend/controllers/userController.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Use the capitalized 'User' model name

// --- Helper function to generate JWT ---
// Takes a user ID as payload, signs it with the secret, and sets an expiration
const generateToken = (id) => {
  // Ensure JWT_SECRET is loaded from .env
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    // In a real app, you might want to prevent the server from starting
    // or throw a more specific error here.
    // For now, we'll throw a generic error to be caught by the handler.
    throw new Error('Server configuration error: JWT secret missing.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Example: Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, bio, profilePicture } = req.body;

  // --- Basic Validation ---
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }
  // Additional validation (like password length) is handled by Mongoose schema

  // --- Check if user already exists ---
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // --- Create user ---
  // Password hashing is handled by the pre-save hook in the User model
  const user = await User.create({
    name,
    email,
    password, // Provide the plain password, Mongoose hook will hash it
    bio: bio || '', // Set optional fields, defaulting if not provided
    profilePicture: profilePicture || '',
  });

  // --- Respond with user data and token ---
  if (user) {
    // User object returned by create won't have the password due to `select: false`
    res.status(201).json({
      _id: user._id, // Use _id from MongoDB document
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      token: generateToken(user._id), // Generate and send JWT
      createdAt: user.createdAt, // Include timestamps if needed
      updatedAt: user.updatedAt,
    });
  } else {
    // This case should ideally not be reached if validation passes and DB is ok
    res.status(500); // Internal Server Error might be more appropriate
    throw new Error('User registration failed');
  }
});

// @desc    Authenticate a user (login)
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // --- Basic Validation ---
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // --- Find user by email ---
  // Need to explicitly select the password field because it's excluded by default
  const user = await User.findOne({ email }).select('+password');

  // --- Check if user exists and password matches ---
  // Use the matchPassword method defined in the User model
  if (user && (await user.matchPassword(password))) {
    // --- Respond with user data and token ---
    // Manually construct the response object to exclude the password
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      token: generateToken(user._id), // Generate and send JWT
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } else {
    // --- Authentication failed ---
    res.status(401); // Unauthorized status
    throw new Error('Invalid email or password'); // Keep the message generic
  }
});

// TODO: Add controllers for getting user profile, updating profile etc.
// Example: Get current user profile (requires authentication middleware)
// const getUserProfile = asyncHandler(async (req, res) => {
//   // Assuming auth middleware adds user to req.user
//   const user = await User.findById(req.user._id); // req.user._id comes from the decoded token
//   if (user) {
//      res.status(200).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       bio: user.bio,
//       profilePicture: user.profilePicture,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//      });
//   } else {
//      res.status(404);
//      throw new Error('User not found');
//   }
// });

module.exports = {
  registerUser,
  loginUser,
  // getUserProfile, // Export future controllers here
};
