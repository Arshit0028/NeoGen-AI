import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

/* CORS */
app.use(
  cors({
    origin: "*",
    methods: ["POST"],
  }),
);

app.use(express.json());

/* 🔐 Rate limit: 30 RPM per IP */
const askLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    answer: "⚠️ Too many requests. Please wait a minute and try again.",
  },
});

/* Groq client */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* API */
app.post("/api/ask", askLimiter, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.json({ answer: "Question is required." });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: question }],
      temperature: 0.4,
      max_tokens: 256,
    });

    const answer =
      completion?.choices?.[0]?.message?.content || "⚠️ No response from AI.";

    return res.json({ answer });
  } catch (err) {
    console.error("Groq error:", err.message);

    return res.json({
      answer:
        "⚠️ AI is busy right now (free tier limit). Please try again shortly.",
    });
  }
});

/* Render-compatible port */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Groq backend running with rate limits on port ${PORT}`);
});
