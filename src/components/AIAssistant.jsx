 
import { useState, useRef, useEffect } from "react";

import API, { errorMessage } from "../api/axios";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const content = (text ?? input).trim();

    if (!content || loading) return;


    const nextMessages = [
      ...messages,
      { role: "user", content },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      // Authenticated call to POST /api/ai/chat (API key stays on the server)
      const { data } = await API.post("/ai/chat", { messages: nextMessages });

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("AI returned an empty response.");
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply.trim(),
        },
      ]);
    } catch (err) {
      console.error("AI chat request failed:", err);

      setError(errorMessage(err, err.message || "Something went wrong."));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>AI Assistant</h2>
          <p style={styles.subtitle}>
            Ask anything. Answers are AI-generated — verify important info.
          </p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            style={styles.clearBtn}
            disabled={loading}
          >
            Clear
          </button>
        )}
      </header>

      <div style={styles.chat}>
        {messages.length === 0 && (
          <div style={styles.welcome}>
            <h3 style={{ margin: "0 0 8px" }}>
              How can I help you today?
            </h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Ask a question to start chatting.
              English, Urdu, and Roman Urdu are fine.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: isUser ? "flex-end" : "flex-start",
                background: isUser ? "#2563eb" : "#f1f5f9",
                color: isUser ? "#fff" : "#0f172a",
              }}
            >
              <strong style={styles.roleLabel}>
                {isUser ? "You" : "AI"}
              </strong>

              <div style={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={styles.status}>
            AI is thinking…
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              style={styles.dismiss}
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message your AI assistant… (Enter to send, Shift+Enter for new line)"
          disabled={loading}
          maxLength={8000}
          rows={1}
          style={styles.input}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            ...styles.button,
            opacity: loading || !input.trim() ? 0.55 : 1,
            cursor:
              loading || !input.trim()
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? "Thinking…" : "Send"}
        </button>
      </form>

      <p style={styles.note}>
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "min(75vh, 800px)",
    minHeight: "450px",
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    color: "#0f172a",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  clearBtn: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    color: "#475569",
    fontSize: "0.875rem",
  },
  chat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    overflowY: "auto",
    padding: "16px 0",
  },
  welcome: {
    textAlign: "center",
    margin: "auto",
    color: "#64748b",
    padding: "24px",
  },
  message: {
    maxWidth: "85%",
    padding: "12px 16px",
    borderRadius: "14px",
    overflowWrap: "anywhere",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },
  roleLabel: {
    display: "block",
    fontSize: "0.75rem",
    opacity: 0.85,
    marginBottom: "4px",
  },
  status: {
    color: "#64748b",
    padding: "8px 4px",
    fontSize: "0.9rem",
  },
  error: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "0.9rem",
  },
  dismiss: {
    border: 0,
    background: "transparent",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  form: {
    display: "flex",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e2e8f0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "13px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "16px",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "48px",
    maxHeight: "160px",
    lineHeight: 1.4,
  },
  button: {
    padding: "12px 20px",
    border: 0,
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    height: "48px",
  },
  note: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "12px",
    margin: "10px 0 0",
  },
};
