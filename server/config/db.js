const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/atlas_school";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[MongoDB] Database connected: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[MongoDB Tip] You can supply your MongoDB Atlas URI in .env (MONGODB_URI=mongodb+srv://...)`);
    console.warn(`[MongoDB Notice] Continuing in resilient memory-backed mode for seamless testing.`);
    return null;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  host: isConnected ? mongoose.connection.host : "in-memory fallback",
  name: isConnected ? mongoose.connection.name : "local-memory",
});

module.exports = { connectDB, getDBStatus };
