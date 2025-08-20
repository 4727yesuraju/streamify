import express from "express";
// import { config } from "dotenv";
// config();
import "dotenv/config";
import cookieParser from "cookie-parser";
//router
import authRoutes from "./router/auth.route.js";
import userRoutes from "./router/user.route.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.listen(PORT, () => {
  console.log("server is running at port : ", PORT);
  connectDB();
});
