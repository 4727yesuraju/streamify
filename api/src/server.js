import express from "express";
// import { config } from "dotenv";
// config();
import "dotenv/config";

//router
import authRoutes from "./router/auth.route.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
  console.log("server is running at port : ", PORT);
  connectDB();
});
