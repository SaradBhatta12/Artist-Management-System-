import rateLimit from "express-rate-limit";
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

export default loginLimiter;