import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Loader2, Bot, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RAG Assistant" },
      { name: "description", content: "Chat with the RAG Assistant." },
    ],
  }),
  component: Index,
});

const API_URL = "https://eloise-uncomplicated-nonhedonically.ngrok-free.dev/chat";

type Message = {
  id: string;
  role: "user" | "bot" | "error";
  content: string;
  timestamp: Date;
};

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: question, timestamp: new Date() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const reply =
        typeof data === "string"
          ? data
          : data.answer ?? data.response ?? data.reply ?? data.message ?? JSON.stringify(data);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "bot", content: String(reply), timestamp: new Date() }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "error",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-glow shadow-lg shadow-primary/30">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">RAG Assistant</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                </span>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
            {messages.length === 0 && (
              <div className="mt-24 flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary-glow/30 shadow-[0_0_40px_rgba(124,58,237,0.4)]">
                  <Sparkles className="h-9 w-9 text-primary-foreground" />
                </div>
                <h2 className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-2xl font-semibold text-transparent">
                  Welcome to RAG Assistant
                </h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Ask me anything. I'll search through knowledge and give you grounded answers.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && (
              <div className="flex items-end gap-3 animate-fade-in-up">
                <Avatar role="bot" />
                <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce-dot" />
                    <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce-dot [animation-delay:0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-primary/80 animate-bounce-dot [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="sticky bottom-0 border-t border-border/50 bg-background/40 backdrop-blur-xl">
          <form onSubmit={handleSend} className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
            <div className="group relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="w-full rounded-full border border-border bg-card/80 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(124,58,237,0.15),0_0_20px_rgba(124,58,237,0.25)] disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="group flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-glow px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 hover:animate-pulse-glow disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "bot" }) {
  if (role === "bot") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-md shadow-primary/30">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20">
      You
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div className={`flex flex-col gap-1 animate-fade-in-up ${isUser ? "items-end" : "items-start"}`}>
      <div className={`flex items-end gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <Avatar role={isUser ? "user" : "bot"} />
        <div
          className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/20"
              : isError
                ? "rounded-bl-md border border-destructive/40 bg-destructive/10 text-destructive"
                : "rounded-bl-md border border-border bg-card text-foreground"
          }`}
        >
          {message.content}
        </div>
      </div>
      <span className={`px-12 text-[10px] text-muted-foreground/70 ${isUser ? "text-right" : "text-left"}`}>
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
