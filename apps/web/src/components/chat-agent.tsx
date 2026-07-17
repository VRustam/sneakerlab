'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Bot, MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

function renderMarkdownLinks(text: string) {
  // Convert markdown links [text](/path) to clickable elements
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (match) {
      return (
        <Link
          key={i}
          href={match[2] ?? ''}
          className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {match[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function ChatAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || isPending) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    startTransition(async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [
            ...prev,
            { role: 'model', parts: [{ text: data.response }] },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              parts: [{ text: "Sorry, I'm having trouble right now. Please try again! 🙏" }],
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            parts: [{ text: "Connection error. Please check your internet and try again." }],
          },
        ]);
      }
    });
  }, [input, isPending, messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-300',
          open
            ? 'bg-card text-foreground hover:bg-accent'
            : 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-2xl hover:shadow-primary/25',
        )}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/30 animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold">SneakerLab AI</h3>
              <p className="text-xs text-muted-foreground">Your sneaker shopping assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Hey there! 👋</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    I can help you find the perfect sneakers. Try asking:
                  </p>
                </div>
                <div className="grid w-full gap-1.5">
                  {[
                    'Show me running shoes under $200',
                    'What sneakers are on sale?',
                    'I need basketball shoes',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      onClick={() => {
                        setInput(suggestion);
                        requestAnimationFrame(() => inputRef.current?.focus());
                      }}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  'mb-3 flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : 'rounded-bl-md bg-accent text-accent-foreground',
                  )}
                >
                  {msg.role === 'model'
                    ? renderMarkdownLinks(msg.parts[0]?.text ?? '')
                    : msg.parts[0]?.text}
                </div>
              </div>
            ))}

            {isPending && (
              <div className="mb-3 flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-accent px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                disabled={isPending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sneakers..."
                type="text"
                value={input}
              />
              <button
                aria-label="Send message"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                disabled={isPending || !input.trim()}
                onClick={sendMessage}
                type="button"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
