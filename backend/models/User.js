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
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
        'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, and 1 number',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Defines the possible values for the role
      default: 'user', // Sets the default role for new users
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
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

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, reset the attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock the account if we've reached max attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 5 * 60 * 1000 }; // Lock for 5 minutes
  }
  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Create and export the User model based on the schema
module.exports = mongoose.model('User', userSchema);
