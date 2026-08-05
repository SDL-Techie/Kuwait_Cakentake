import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, X, Send, RotateCcw } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { sendChatMessage, type ChatMessage } from "../../services/chatbotService";
import ChatMessageBubble from "./ChatMessageBubble";
import "./ChatWidget.css";

const HISTORY_KEY = "chatbot_history";

const SUGGESTED_REPLIES = [
  "Show me eggless cakes",
  "Track my order",
  "What's in my cart?",
  "Build my own cake",
];

const welcomeMessage = (name?: string): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  text: name
    ? `Hi ${name}! I'm Baker 🎂 — ask me about cakes, your cart, or an order, and I'll help you out.`
    : "Hi, I'm Baker 🎂 — ask me about our cakes, track an order, or check your cart. Log in for the full experience!",
  timestamp: new Date().toISOString(),
});

const loadHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt history, fall through to empty
  }
  return [];
};

const saveHistory = (messages: ChatMessage[]) => {
  try {
    // Keep storage bounded — only persist the last 50 turns.
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-50)));
  } catch {
    // localStorage may be full/unavailable — chat still works, just not persisted
  }
};

const ChatWidget: React.FC = () => {
  const { customer, isLoggedIn } = useCustomerAuth();
  const navigate = useNavigate();
  void navigate; // reserved for future auto-navigation features

  const location = useLocation();
  const isHomePage = location.pathname === "/"; // adjust to your actual home route

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const existing = loadHistory();
    return existing.length ? existing : [welcomeMessage()];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Personalize the very first auto-message once we know who's logged in.
      setMessages((prev) =>
        prev.length === 1 && prev[0].id === "welcome"
          ? [welcomeMessage(customer?.name)]
          : prev
      );
      inputRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close the panel automatically if the user navigates away from home
  // while it's open, so it doesn't linger open on other pages.
  useEffect(() => {
    if (!isHomePage && isOpen) {
      setIsOpen(false);
    }
  }, [isHomePage, isOpen]);

  const pushUserMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: "u_" + Date.now().toString(36),
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  const dispatchMessage = async (text: string) => {
    setError(null);
    setLastFailedMessage(null);
    setIsTyping(true);
    try {
      const reply = await sendChatMessage(text);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setError("Baker is having trouble responding. Please try again.");
      setLastFailedMessage(text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping) return;
    pushUserMessage(text);
    setInput("");
    dispatchMessage(text);
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      dispatchMessage(lastFailedMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    localStorage.removeItem("chatbot_session_id");
    const fresh = [welcomeMessage(customer?.name)];
    setMessages(fresh);
    setError(null);
    setLastFailedMessage(null);
  };

  // All hooks are declared above this line — safe to bail out now.
  // Widget is only shown on the home page.
  if (!isHomePage) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        className="baker-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Open Baker chat assistant"
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  return (
    <div className="baker-chat-panel" role="dialog" aria-label="Baker chat assistant">
      <div className="baker-chat-header">
        <div className="baker-chat-header-title">
          <span className="baker-chat-avatar">🎂</span>
          <div>
            <p className="baker-chat-name">Baker</p>
            <p className="baker-chat-status">
              {isLoggedIn ? `Helping ${customer?.name?.split(" ")[0]}` : "Cake assistant"}
            </p>
          </div>
        </div>
        <div className="baker-chat-header-actions">
          <button
            className="baker-icon-btn"
            onClick={handleNewChat}
            aria-label="Start new chat"
            title="New chat"
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="baker-icon-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="baker-chat-body" ref={scrollRef}>
        {messages.map((m) => (
          <ChatMessageBubble key={m.id} message={m} />
        ))}

        {isTyping && (
          <div className="baker-msg-row baker-msg-row-bot">
            <div className="baker-msg-bubble baker-msg-bot baker-typing">
              <span className="baker-typing-dot" />
              <span className="baker-typing-dot" />
              <span className="baker-typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="baker-error-row">
            <span>{error}</span>
            <button className="baker-retry-btn" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
      </div>

      {messages.length <= 1 && !isTyping && (
        <div className="baker-suggestions">
          {SUGGESTED_REPLIES.map((s) => (
            <button key={s} className="baker-suggestion-chip" onClick={() => handleSend(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="baker-chat-input-row">
        <input
          ref={inputRef}
          className="baker-chat-input"
          type="text"
          placeholder="Ask Baker anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button
          className="baker-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;