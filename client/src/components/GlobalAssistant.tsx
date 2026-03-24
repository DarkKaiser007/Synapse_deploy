import { useEffect, useMemo, useRef, useState } from "react";
import { Brain, Send, ShieldAlert, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/auth";

interface GlobalChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const STORAGE_KEY = "synapse_global_chat_history";
const MAX_HISTORY = 50;

const INITIAL_GREETING: GlobalChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your SYNAPSE Assistant 👋\nI can help you navigate SYNAPSE, answer study questions, or guide you through any feature. What would you like to know?",
  createdAt: new Date().toISOString(),
};

export default function GlobalAssistant() {
  const { user } = useAuthStore();
  const location = useLocation();
  const isNoteDetail = /^\/notes\/.+/.test(location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const shouldRender = user && location.pathname !== "/login" && location.pathname !== "/register";

  useEffect(() => {
    if (!shouldRender) return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as GlobalChatMessage[];
      if (Array.isArray(parsed)) {
        setMessages(
          parsed
            .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
            .slice(-MAX_HISTORY),
        );
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages, shouldRender]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const floatingButtonPositionClass = useMemo(() => {
    if (isNoteDetail) {
      return "top-4 right-20 lg:right-8";
    }

    return "top-4 right-4";
  }, [isNoteDetail]);

  if (!shouldRender) {
    return null;
  }

  const openAssistant = () => {
    if (messages.length === 0) {
      setMessages([INITIAL_GREETING]);
    }
    setIsOpen(true);
  };

  const toggleAssistant = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openAssistant();
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextUserMessage: GlobalChatMessage = {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextHistory = [...messages, nextUserMessage].slice(-MAX_HISTORY);
    setMessages(nextHistory);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat/global", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: trimmed,
          conversationHistory: nextHistory.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      const data = await response.json().catch(() => ({} as { reply?: string; error?: string }));
      const assistantReply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply
          : "I couldn't generate a response right now. Please try again.";

      if (!response.ok && data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => {
        const updated = [
          ...prev,
          {
            role: "assistant" as const,
            content: assistantReply,
            createdAt: new Date().toISOString(),
          },
        ].slice(-MAX_HISTORY);

        return updated;
      });

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "I couldn't reach the assistant just now. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ].slice(-MAX_HISTORY));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className={`fixed z-[60] ${floatingButtonPositionClass}`}>
        <button
          type="button"
          onClick={toggleAssistant}
          aria-label={isOpen ? "Close SYNAPSE Assistant" : "Open SYNAPSE Assistant"}
          className="relative bg-[var(--color-primary)] hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
        >
          <Brain className="h-6 w-6" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-300 border border-white/70" />
          )}
        </button>
      </div>

      <div
        className={`fixed top-16 right-4 z-[60] w-[380px] h-[500px] rounded-2xl border border-white/15 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all duration-200 origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden rounded-2xl">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <h2 className="text-sm font-semibold text-white">SYNAPSE Assistant</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                className="text-xs px-2 py-1 rounded border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
              >
                Clear Chat
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Minimize SYNAPSE Assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.createdAt}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                      : "bg-white/5 border border-white/10 text-gray-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-300/70 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-blue-300/70 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-blue-300/70 animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Ask SYNAPSE Assistant..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-blue-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={() => {
                  void sendMessage();
                }}
                disabled={isSending || !input.trim()}
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 flex items-start gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5 text-gray-500" />
              <span>SYNAPSE is AI and can make mistakes. Please double-check responses.</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
