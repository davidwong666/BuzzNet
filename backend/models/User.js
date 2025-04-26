const mongoose = require('mongoose');
// Library for hashing passwords
const bcrypt = require('bcryptjs');

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    name: {
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
    // profilePicture field remains removed/commented
    /* // Kept for potential future use, but not actively used in signup/login
    profilePicture: {
      type: String,
      default: '',
    },
    */
    // Kept for potential future use, but not actively used in signup/login
    bio: {
      type: String,
      trim: true,
      maxlength: [160, 'Bio cannot be more than 160 characters'],
      default: '', // Default ensures it's optional
    },
    // Optional fields remain commented out
    // likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    // following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Middleware ---

// Hash password BEFORE saving a new user or updating the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Mongoose Instance Methods ---

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
