// Utility to handle asynchronous Express route handlers and middleware
const asyncHandler = require('express-async-handler');
// Library for verifying JSON Web Tokens
const jwt = require('jsonwebtoken');
// User model to fetch user details from the database
const User = require('../models/User'); // Adjust path if your User model is elsewhere

// Middleware function to protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the Authorization header (Bearer TOKEN_STRING)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the JWT_SECRET from your environment variables
      // This will throw an error if the token is invalid or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // If token is valid, 'decoded' will contain the payload (e.g., { id: userId, iat: ..., exp: ... })
      // Fetch the user from the database using the ID from the token
      // We exclude the password field from being returned
      req.user = await User.findById(decoded.id).select('-password');

      // If no user is found with that ID (e.g., user deleted after token issuance)
      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error('Not authorized, user associated with this token no longer exists');
      }

      // If user is found, proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Token verification failed:', error.message);
      res.status(401); // Unauthorized
      // Provide a more generic error message to the client
      throw new Error('Not authorized, token failed or invalid');
    }
  } else {
    // This 'else' block explicitly handles when the Authorization header is missing or not 'Bearer'
    res.status(401); // Unauthorized
    throw new Error('Not authorized, no token provided or token is not Bearer type');
  }
});

// Middleware to check if user is admin
const isAdmin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

module.exports = { protect, isAdmin };
