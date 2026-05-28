const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Since Mongoose 6 / Node MongoDB Driver v4, these options are no longer needed
    // and passing them causes deprecation warnings. Connect with the URI only.
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
