"use client";

import { useEffect, useRef, useState } from "react";
import { bus, BusEvents } from "@/game/net/bus";

interface ChatMessage {
  id: number;
  name: string;
  text: string;
  self: boolean;
}

let nextId = 1;

/**
 * Bottom-left chat: recent messages + input. Messages also appear as
 * overhead bubbles in-world; this panel is the readable history. The world
 * keeps moving while you type (movement keys are ignored during focus).
 */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return bus.on(BusEvents.ChatReceived, (m: { name: string; text: string; self: boolean }) => {
      setMessages((prev) => [...prev.slice(-49), { id: nextId++, name: m.name, text: m.text, self: m.self }]);
    });
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  // Global Enter focuses the chat, Escape blurs it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
        e.preventDefault();
      } else if (e.key === "Escape") {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = () => {
    const text = draft.trim();
    if (text) bus.emit(BusEvents.ChatSend, { text });
    setDraft("");
  };

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 w-[min(320px,calc(100vw-32px))]">
      {messages.length > 0 && (
        <div
          ref={listRef}
          className="mb-2 max-h-40 overflow-y-auto rounded-2xl bg-[#1c1a24]/60 backdrop-blur border border-white/10 px-3 py-2 space-y-1 text-[13px] leading-snug"
        >
          {messages.map((m) => (
            <p key={m.id} className="break-words">
              <span className={m.self ? "text-[#ffe9b0]" : "text-[#9dd9c0]"}>{m.name}</span>
              <span className="text-[#f2ecdf]/90"> {m.text}</span>
            </p>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 140))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
              e.stopPropagation();
            }
          }}
          placeholder="press enter, say something nice…"
          className="flex-1 rounded-full bg-[#1c1a24]/70 backdrop-blur border border-white/10 px-4 py-2 text-sm outline-none focus:border-[#ffb46b]/60 placeholder:text-[#6b6478]"
        />
        <button
          type="button"
          onClick={send}
          className="rounded-full bg-[#ffb46b] text-[#2c2430] px-4 text-sm font-semibold hover:bg-[#ffc78d] transition-colors"
          aria-label="send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
