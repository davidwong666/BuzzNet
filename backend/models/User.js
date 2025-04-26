const mongoose = require('mongoose');
// Library for hashing passwords
const bcrypt = require('bcryptjs');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    // User's display name
    name: {
      type: String,
      required: [true, 'Please provide a name'], // Name is required
      trim: true, // Remove leading/trailing whitespace
    },
    // User's email address (used for login and uniqueness)
    email: {
      type: String,
      required: [true, 'Please provide an email'], // Email is required
      unique: true, // Ensure email addresses are unique in the database
      lowercase: true, // Store emails in lowercase for consistency
      trim: true, // Remove leading/trailing whitespace
      // Basic email format validation using regex
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    // User's password (will be stored as a hash)
    password: {
      type: String,
      required: [true, 'Please provide a password'], // Password is required
      minlength: [6, 'Password must be at least 6 characters long'], // Enforce minimum length
      select: false, // IMPORTANT: Exclude password from query results by default
    },
    // TODO: URL to the user's profile picture
    profilePicture: {
      type: String,
      default: '', // Default to an empty string or a placeholder image URL
    },
    // TODO: Short user biography
    bio: {
      type: String,
      trim: true,
      maxlength: [160, 'Bio cannot be more than 160 characters'], // Limit bio length
      default: '',
    },
    // Optional: Array of ObjectIds referencing Posts the user has liked
    // likedPosts: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Post'
    // }],
    // Optional: Array of ObjectIds referencing Users this user follows
    // following: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User'
    // }],
    // Optional: Array of ObjectIds referencing Users who follow this user
    // followers: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User'
    // }]
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' timestamp fields
    timestamps: true,
  }
);

// --- Mongoose Middleware ---

// Hash password BEFORE saving a new user or updating the password
// Use a regular function here to ensure 'this' refers to the document
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified (or is new)
  if (!this.isModified('password')) {
    return next(); // Skip hashing if password hasn't changed
  }

  try {
    // Generate a salt (random data to add to the hash)
    // A higher salt factor (e.g., 12) is more secure but slower
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    // Proceed to save the document
    next();
  } catch (error) {
    // Pass any errors during hashing to the next middleware/error handler
    next(error);
  }
});

// --- Mongoose Instance Methods ---

// Method to compare entered password with the hashed password in the database
// Use a regular function here to ensure 'this' refers to the document
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' refers to the hashed password stored in the current user document
  // bcrypt.compare handles the comparison securely
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
