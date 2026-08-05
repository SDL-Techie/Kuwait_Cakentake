import React from "react";
import { useNavigate } from "react-router-dom";
import type { ChatMessage } from "../../services/chatbotService";
import "./ChatWidget.css";

interface Props {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<Props> = ({ message }) => {
  const navigate = useNavigate();
  const isUser = message.role === "user";

  return (
    <div className={`baker-msg-row ${isUser ? "baker-msg-row-user" : "baker-msg-row-bot"}`}>
      <div className={`baker-msg-bubble ${isUser ? "baker-msg-user" : "baker-msg-bot"}`}>
        <p className="baker-msg-text">{message.text}</p>

        {!!message.products?.length && (
          <div className="baker-product-cards">
            {message.products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                className="baker-product-card"
                onClick={() => p.productUrl && navigate(p.productUrl)}
              >
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="baker-product-img" />
                )}
                <div className="baker-product-info">
                  <span className="baker-product-name">{p.name}</span>
                  <span className="baker-product-price">₹{p.price}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {message.redirectUrl && (
          <button
            className="baker-redirect-btn"
            onClick={() => navigate(message.redirectUrl as string)}
          >
            {message.redirectLabel || "View"} →
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;