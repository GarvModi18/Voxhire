import express from "express"; // Express import
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes"; // Make sure the path is correct for auth.routes
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the routes
app.use("/api/auth", authRoutes); // This should work correctly if `authRoutes` is an instance of Router

// Set up the port for the server to listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
