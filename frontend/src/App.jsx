import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  const API_URL =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : "https://neoge.onrender.com";

  const endRef = useRef(null);
  const hasStarted = messages.length > 0;

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async () => {
    if (!question.trim() || loading) return;

    const q = question;
    setQuestion("");
    setMessages((p) => [...p, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      setMessages((p) => [
        ...p,
        { role: "ai", text: data.answer || "No response" },
      ]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <div className="app">
        {/* HEADER */}
        <header className="top-bar">
          <span className="brand">NeoGen AI🤖</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(!dark)}
            />
            <span className="slider" />
          </label>
        </header>

        {/* CHAT */}
        <main className={`chat ${!hasStarted ? "center" : ""}`}>
          {!hasStarted && <div>Ask anything to get started ✨</div>}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                className={`row ${m.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {m.role === "ai" && <div className="avatar ai">AI</div>}
                <div className="bubble">{m.text}</div>
                {m.role === "user" && <div className="avatar user">You</div>}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="row ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="avatar ai">AI</div>
              <div className="bubble subtle">Thinking…</div>
            </motion.div>
          )}

          <div ref={endRef} />
        </main>

        {/* INPUT */}
        <motion.div className={`input ${!hasStarted ? "floating" : ""}`} layout>
          <textarea
            placeholder="Ask anything…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            inputMode="text"
          />
          <button onClick={askAI} disabled={!question.trim() || loading}>
            →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
