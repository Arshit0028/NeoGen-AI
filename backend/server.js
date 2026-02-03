import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.json({ answer: "Question is required." });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: question }],
      temperature: 0.5, // 👈 best for Q&A
    });

    const answer =
      completion?.choices?.[0]?.message?.content ?? "⚠️ No response from AI.";

    res.json({ answer });
  } catch (err) {
    console.error("Groq error:", err.message);
    res.json({
      answer:
        "⚠️ Groq free limit reached or model unavailable. Try again later.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ FREE Groq AI backend running on port ${PORT}`);
});
