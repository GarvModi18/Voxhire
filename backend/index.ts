import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import mongoose from "mongoose";
import dotenv from "dotenv";
import interviewRoutes from "./routes/interview.routes";

dotenv.config();

const app = express();

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Register Routes BEFORE starting the server
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

// ✅ Print Registered Routes (Debugging)
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`🔗 Route: ${r.route.path}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});

// ✅ EXPORT `app` FOR TESTING
export { app };
