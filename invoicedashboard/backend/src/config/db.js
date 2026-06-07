const mongoose = require('mongoose');

const connect = async () => {
    const uri = process.env.MONGO_URI;
  
    mongoose.connection.on('connected', () =>
      console.log(`MongoDB connected: ${mongoose.connection.host}`)
    );
    mongoose.connection.on('error', (err) =>
      console.error(`MongoDB error: ${err.message}`)
    );
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected — retrying in 5s...');
      setTimeout(connect, 5000);
    });
  
    await mongoose.connect(uri);
  };
  
  module.exports = { connect };