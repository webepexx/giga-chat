'use client';

import { ArrowBigRight, Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket-client";

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
};

export default function ModChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    // Initialize socket server
    fetch("/api/socket");

    const socket = socketRef.current;

    // IMPORTANT: identify as MOD
    socket.emit("mod:online", {
      modId: "MOD_ID_FROM_SESSION", // replace with real session mod id
    });

    socket.on("chat:connected", () => {
      setMessages([]);
      setConnected(true);
    });

    socket.on("chat:message", (msg: string) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "them", text: msg },
      ]);
    });

    socket.on("chat:ended", () => {
      setConnected(false);
      setMessages([]);
    });

    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !connected) return;

    socketRef.current.emit("chat:message", input);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: input },
    ]);

    setInput("");
  };

  return (
    <div className="h-screen w-full bg-[#0b0f1a] text-white flex overflow-hidden">

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0e1326]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
              M
            </div>
            <span className="font-medium">
              {connected ? "User Connected" : "Waiting for user..."}
            </span>
          </div>

          <button className="p-2 text-white/60">
            <Bell />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  m.sender === "me" ? "bg-indigo-600" : "bg-white/10"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4 bg-[#0e1326]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={connected ? "Reply to user..." : "Waiting..."}
              disabled={!connected}
              className="flex-1 bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 outline-none disabled:opacity-40"
            />

            <button
              onClick={sendMessage}
              disabled={!connected}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
            >
              <ArrowBigRight />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
