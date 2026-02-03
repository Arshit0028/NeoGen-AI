import rateLimit from "express-rate-limit";

const askLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    answer: "⚠️ Too many requests. Please wait a minute and try again.",
  },
});
