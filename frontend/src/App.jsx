import { useState, useRef, useEffect } from "react";
import "./index.css";

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
      : "https://neogen-ai.onrender.com";

  const endRef = useRef(null);

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askAI = async () => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || "No response" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong." },
      ]);
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
    <div className="app">
      {/* Header */}
      <header className="top-bar">
        <div className="bot-info">
          <span className="status-dot" />
          <span className="bot-name">AI ChatBot</span>
        </div>

        {/* Dark Mode Toggle */}
        <div className="theme-toggle">
          <span className="label">{dark ? "🌑Darkmode" : "✨Lightmode"}</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={dark}
              onChange={() => setDark(!dark)}
            />
            <span className="slider" />
          </label>
        </div>
      </header>

      {/* Chat */}
      <main className="chat-area">
        <div className="chat-wrapper">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
              {m.role === "ai" && (
                <span className="ai-badge">✨ Answered by AI</span>
              )}
            </div>
          ))}

          {/* Typing dots */}
          {loading && (
            <div className="msg ai">
              <div className="bubble typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="input-bar">
        <textarea
          placeholder="Type your message…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button onClick={askAI} disabled={!question.trim()}>
          Send
        </button>
      </footer>
    </div>
  );
}
