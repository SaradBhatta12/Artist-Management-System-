import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import musicRoutes from "./routes/music.routes.js";
import artistRoutes from "./routes/artist.routes.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors from "cors"
// Load env vars
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}))


// Middleware
app.use(express.json()); // parse JSON requests
app.use(cookieParser());


// Example route
app.use("/api/user", userRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/artist", artistRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});
