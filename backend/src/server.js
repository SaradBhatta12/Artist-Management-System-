import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import musicRoutes from "./routes/music.routes.js";
import artistRoutes from "./routes/artist.routes.js";

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // parse JSON requests

// Example route
app.use("/user", userRoutes);
app.use("music", musicRoutes);
app.use("/artist", artistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
