const mongoose = require('mongoose');
let MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI || String(MONGO_URI).includes('<') || String(MONGO_URI).includes('MONGO_USER')) {
  if (process.env.NODE_ENV === 'production') {
    console.error('MONGO_URI is not configured for production. Set MONGO_URI to your MongoDB Atlas connection string.');
    process.exit(1);
  }
  console.warn('MONGO_URI looks like a placeholder or is missing; falling back to local MongoDB for development/demo');
  MONGO_URI = 'mongodb://localhost:27017/civicconnect';
}

let isConnected = false;
let memoryServer = null;

async function connect(retries = 3, backoffMs = 2000) {
  if (isConnected) return mongoose;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      isConnected = true;
      console.log('MongoDB connected to', MONGO_URI);
      return mongoose;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed`);
      if (attempt === retries) {
        console.error('Exceeded MongoDB connection retries.');
        console.error(err.message);
        if (process.env.NODE_ENV === 'production') {
          console.error('Unable to connect to MongoDB in production — exiting.');
          process.exit(1);
        }
        // In development, attempt in-memory server as a last resort
        try {
          console.warn('Attempting to start in-memory MongoDB for development/demo.');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          memoryServer = await MongoMemoryServer.create();
          MONGO_URI = memoryServer.getUri();
          console.log('In-memory MongoDB running at', MONGO_URI);
          await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
          isConnected = true;
          console.log('MongoDB connected to in-memory server');
          return mongoose;
        } catch (memErr) {
          console.error('Failed to start in-memory MongoDB:', memErr && memErr.message ? memErr.message : memErr);
          process.exit(1);
        }
      }
      await new Promise(r => setTimeout(r, backoffMs * attempt));
    }
  }
}

module.exports = { connect, mongoose };
