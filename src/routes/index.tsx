import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";

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
};

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

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const reply =
        typeof data === "string"
          ? data
          : data.answer ?? data.response ?? data.reply ?? data.message ?? JSON.stringify(data);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "bot", content: String(reply) }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "error",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">RAG Assistant</h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
            {messages.length === 0 && (
              <div className="mt-20 text-center text-muted-foreground">
                <Bot className="mx-auto mb-3 h-10 w-10 opacity-50" />
                <p className="text-sm">Ask anything to get started.</p>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && (
              <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur">
          <form onSubmit={handleSend} className="mx-auto flex max-w-3xl gap-2 px-4 py-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : isError
              ? "rounded-bl-sm border border-destructive/30 bg-destructive/10 text-destructive"
              : "rounded-bl-sm bg-muted text-foreground"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
