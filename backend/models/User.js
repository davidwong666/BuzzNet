// * Good for now

const mongoose = require('mongoose');
// Library for hashing passwords
const bcrypt = require('bcryptjs');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Defines the possible values for the role
      default: 'user', // Sets the default role for new users
    },
    // Future implementation: Profile picture URL, bio, lastActive, etc.
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Middleware ---

// Hash password BEFORE saving a new user or updating the password
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }
  // Hash the password with cost of 10
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (error) {
    next(error); // Pass errors to the next middleware
  }
});

// --- Mongoose Instance Methods ---

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this.password' refers to the hashed password of the user instance
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
