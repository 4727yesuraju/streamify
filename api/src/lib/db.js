import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.info(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    console.log("Error in connecting to MongoDb", error.message);
    process.exit(1);
  }
};
