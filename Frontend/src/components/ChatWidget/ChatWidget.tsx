import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MessageCircle,
  X,
  Send,
  RotateCcw,
  Mic,
  Square,
} from "lucide-react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  sendChatMessage,
  sendVoiceMessage,
  resetChatSession,
  playBakerAudio,
  type ChatMessage,
} from "../../services/chatbotService";

import {
  useCustomerAuth,
} from "../../context/CustomerAuthContext";

import ChatMessageBubble from "./ChatMessageBubble";

import "./ChatWidget.css";

const HISTORY_KEY = "chatbot_history";

const SUGGESTED_REPLIES = [
  "Show me eggless cakes",
  "Track my order",
  "What's in my cart?",
  "Build my own cake",
];

const welcomeMessage = (
  name?: string
): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  text: name
    ? `Hi ${name}! I'm Baker 🎂 — ask me about cakes, your cart, or an order, and I'll help you out.`
    : "Hi, I'm Baker 🎂 — ask me about our cakes, track an order, or check your cart. Log in for the full experience!",
  timestamp: new Date().toISOString(),
});

const loadHistory = (): ChatMessage[] => {
  try {
    const raw =
      localStorage.getItem(HISTORY_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
};

const saveHistory = (
  messages: ChatMessage[]
): void => {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.slice(-50))
    );
  } catch {
    // Chat continues even if localStorage fails.
  }
};

const ChatWidget: React.FC = () => {
  const {
    customer,
    isLoggedIn,
  } = useCustomerAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage =
    location.pathname === "/";

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(() => {
    const existing = loadHistory();

    return existing.length
      ? existing
      : [welcomeMessage()];
  });

  const [
    input,
    setInput,
  ] = useState("");

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    recordingSeconds,
    setRecordingSeconds,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    lastFailedMessage,
    setLastFailedMessage,
  ] = useState<string | null>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const recordingTimerRef =
    useRef<number | null>(null);

  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [
    messages,
    isTyping,
    isOpen,
  ]);

  useEffect(() => {
    if (isOpen) {
      setMessages((prev) =>
        prev.length === 1 &&
        prev[0].id === "welcome"
          ? [
              welcomeMessage(
                customer?.name
              ),
            ]
          : prev
      );

      inputRef.current?.focus();
    }
  }, [
    isOpen,
    customer?.name,
  ]);

  useEffect(() => {
    if (!isHomePage && isOpen) {
      setIsOpen(false);
    }
  }, [
    isHomePage,
    isOpen,
  ]);

  useEffect(() => {
    return () => {
      if (
        recordingTimerRef.current !==
        null
      ) {
        window.clearInterval(
          recordingTimerRef.current
        );
      }

      mediaRecorderRef.current?.stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );
    };
  }, []);

  const pushUserMessage = (
    text: string
  ): void => {
    setMessages((prev) => [
      ...prev,
      {
        id:
          "u_" +
          Date.now().toString(36),
        role: "user",
        text,
        timestamp:
          new Date().toISOString(),
      },
    ]);
  };

  const pushAssistantReply = (
    reply: ChatMessage
  ): void => {
    setMessages((prev) => [
      ...prev,
      reply,
    ]);

    if (
      reply.audioBase64
    ) {
      playBakerAudio(
        reply.audioBase64,
        reply.audioMimeType ||
          "audio/mpeg"
      );
    }
  };

  const dispatchMessage = async (
    text: string
  ): Promise<void> => {
    setError(null);
    setLastFailedMessage(null);
    setIsTyping(true);

    try {
      const reply =
        await sendChatMessage(text);

      pushAssistantReply(reply);
    } catch {
      setError(
        "Baker is having trouble responding. Please try again."
      );

      setLastFailedMessage(text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (
    overrideText?: string
  ): void => {
    const text =
      (
        overrideText ??
        input
      ).trim();

    if (
      !text ||
      isTyping ||
      isRecording
    ) {
      return;
    }

    pushUserMessage(text);
    setInput("");

    void dispatchMessage(text);
  };

  const handleRetry = (): void => {
    if (lastFailedMessage) {
      void dispatchMessage(
        lastFailedMessage
      );
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = (): void => {
    resetChatSession();

    localStorage.removeItem(
      HISTORY_KEY
    );

    const fresh = [
      welcomeMessage(
        customer?.name
      ),
    ];

    setMessages(fresh);
    setError(null);
    setLastFailedMessage(null);
  };

  const startRecording =
    async (): Promise<void> => {
      if (
        isTyping ||
        isRecording
      ) {
        return;
      }

      setError(null);

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setError(
          "Voice recording is not supported by this browser."
        );
        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        const preferredMimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
        ];

        const mimeType =
          preferredMimeTypes.find(
            (type) =>
              MediaRecorder.isTypeSupported(
                type
              )
          );

        const recorder =
          mimeType
            ? new MediaRecorder(
                stream,
                { mimeType }
              )
            : new MediaRecorder(
                stream
              );

        audioChunksRef.current =
          [];

        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size > 0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onerror = () => {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          setIsRecording(false);
          setError(
            "Voice recording failed."
          );
        };

        recorder.onstop = async () => {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          if (
            recordingTimerRef.current !==
            null
          ) {
            window.clearInterval(
              recordingTimerRef.current
            );

            recordingTimerRef.current =
              null;
          }

          setIsRecording(false);
          setRecordingSeconds(0);

          const blob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm",
              }
            );

          if (!blob.size) {
            setError(
              "No audio was recorded."
            );
            return;
          }

          setIsTyping(true);

          try {
            const reply =
              await sendVoiceMessage(
                blob
              );

            if (
              reply.text
            ) {
              pushAssistantReply(
                reply
              );
            }
          } catch {
            setError(
              "Baker could not process the voice message. Please try again."
            );
          } finally {
            setIsTyping(false);
          }
        };

        mediaRecorderRef.current =
          recorder;

        recorder.start();

        setIsRecording(true);
        setRecordingSeconds(0);

        recordingTimerRef.current =
          window.setInterval(() => {
            setRecordingSeconds(
              (seconds) => {
                const next =
                  seconds + 1;

                // Maximum recording duration:
                // 60 seconds.
                if (
                  next >= 60
                ) {
                  stopRecording();
                }

                return next;
              }
            );
          }, 1000);
      } catch {
        setError(
          "Microphone permission was denied or unavailable."
        );
      }
    };

  const stopRecording = (): void => {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }
  };

  if (!isHomePage) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        className="baker-fab"
        onClick={() =>
          setIsOpen(true)
        }
        aria-label="Open Baker chat assistant"
      >
        <MessageCircle size={26} />
      </button>
    );
  }

  return (
    <div
      className="baker-chat-panel"
      role="dialog"
      aria-label="Baker chat assistant"
    >
      <div className="baker-chat-header">
        <div className="baker-chat-header-title">
          <span className="baker-chat-avatar">
            🎂
          </span>

          <div>
            <p className="baker-chat-name">
              Baker
            </p>

            <p className="baker-chat-status">
              {isLoggedIn
                ? `Helping ${customer?.name?.split(" ")[0]}`
                : "Cake assistant"}
            </p>
          </div>
        </div>

        <div className="baker-chat-header-actions">
          <button
            className="baker-icon-btn"
            onClick={
              handleNewChat
            }
            aria-label="Start new chat"
            title="New chat"
          >
            <RotateCcw size={18} />
          </button>

          <button
            className="baker-icon-btn"
            onClick={() =>
              setIsOpen(false)
            }
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="baker-chat-body"
        ref={scrollRef}
      >
        {messages.map((m) => (
          <ChatMessageBubble
            key={m.id}
            message={m}
          />
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

            {lastFailedMessage && (
              <button
                className="baker-retry-btn"
                onClick={
                  handleRetry
                }
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {messages.length <= 1 &&
        !isTyping &&
        !isRecording && (
          <div className="baker-suggestions">
            {SUGGESTED_REPLIES.map(
              (suggestion) => (
                <button
                  key={suggestion}
                  className="baker-suggestion-chip"
                  onClick={() =>
                    handleSend(
                      suggestion
                    )
                  }
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

      <div className="baker-chat-input-row">
        <input
          ref={inputRef}
          className="baker-chat-input"
          type="text"
          placeholder={
            isRecording
              ? `Recording ${recordingSeconds}s…`
              : "Ask Baker anything…"
          }
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            isTyping ||
            isRecording
          }
        />

        <button
          className="baker-voice-btn"
          onClick={
            isRecording
              ? stopRecording
              : () => {
                  void startRecording();
                }
          }
          disabled={isTyping}
          aria-label={
            isRecording
              ? "Stop recording"
              : "Record voice message"
          }
          title={
            isRecording
              ? "Stop recording"
              : "Record voice message"
          }
        >
          {isRecording ? (
            <Square size={17} />
          ) : (
            <Mic size={18} />
          )}
        </button>

        <button
          className="baker-send-btn"
          onClick={() =>
            handleSend()
          }
          disabled={
            !input.trim() ||
            isTyping ||
            isRecording
          }
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;