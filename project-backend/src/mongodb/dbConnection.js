import mongoose from "mongoose";
import Good from "./models/Good.js";

const clientOptions = {
  serverApi: {
    version: "1",
    strict: false, // Allow text indexes (not supported in strict mode)
    deprecationErrors: true,
  },
  dbName: "PremiumBenToys",
};

async function connectDB(uri = process.env.MONGO_CONNECTION_STRING) {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("MongoDB connection: Pinged your deployment.");

    // Sync indexes (creates text index if not exists)
    // await Good.syncIndexes();
    // console.log("MongoDB indexes synced.");
  } catch (e) {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
    console.error("Failed to connect to DB: " + e);
    process.exit(1); // Exit if connection fails
  }
}
//connectDB().catch(console.dir);

export default connectDB;
