const mongoose = require('mongoose');

async function connectDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  return mongoose.connection;
}

module.exports = { connectDatabase };
