"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowBigRight } from "lucide-react";
import { getSocket } from "@/lib/socket-mod";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

type Message = {
  id: number;
  sender: "me" | "them";
  text: string;
};

export default function ModChatPage() {
  const socketRef = useRef(getSocket());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const modName = "Moderator_" + Math.floor(Math.random() * 100); // replace with real mod name

  useEffect(() => {
    fetch("/api/socket");

    const socket = socketRef.current;

    socket.emit("mod:online", { modName });

    socket.on("chat:connected", () => {
      setMessages([]);
      setConnected(true);
      setPartnerName("USer");
    });

    socket.on("chat:message", (msg: string) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "them", text: msg },
      ]);
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop:typing", () => setIsTyping(false));

    socket.on("chat:ended", () => {
      setConnected(false); 
      setPartnerName(null);
      setMessages([]);
    });

    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim() || !connected) return;

    socketRef.current.emit("chat:message", input);
    socketRef.current.emit("stop:typing");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: input },
    ]);

    setInput("");
  };

  const handleTyping = (value: string) => {
    setInput(value);
    socketRef.current.emit("typing");

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socketRef.current.emit("stop:typing");
    }, 800);
  };

  const exitChat = () => {

    socketRef.current.emit("chat:next", "they skipped you");
    socketRef.current.emit("stop:typing");

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: input },
    ]);

    setInput("");
    socketRef.current.emit("chat:next");
    setMessages([]);
    setConnected(false);
    setPartnerName(null);
  };

  const handleLogout = async () =>{
    const logout = await signOut()

    redirect("/login")
  }

  return (
    <div className="h-dvh bg-[#0b0f1a] text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/5 flex items-center px-4 bg-[#0e1326]">
        <h1 className="font-semibold">
          {connected
            ? `Chatting with ${partnerName}`
            : "Waiting for user..."}
        </h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                m.sender === "me" ? "bg-indigo-600" : "bg-white/10"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <p className="text-xs text-white/40">
            {partnerName} is typing...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 p-4 bg-[#0e1326]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!connected}
            placeholder="Reply to user..."
            className="flex-1 bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 outline-none disabled:opacity-40"
          />

          <button
            onClick={sendMessage}
            disabled={!connected}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
          >
            <ArrowBigRight />
          </button>
          <button onClick={exitChat}>Log out</button>
        </div>
      </div>
    </div>
  );
}
