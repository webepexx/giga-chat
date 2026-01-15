"use client";

import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket-client";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import ChatControls from "@/components/chat/ChatControls";
import { usePlan } from "@/contexts/PlanContext";
import { Socket } from "socket.io-client";

type Message = { id: number; sender: "me" | "them"; text: string };

export default function UserChatPage() {
  const socketRef = useRef(getSocket());
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchingText, setSearchingText] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(1);
  const { state, decreaseChat } = usePlan()

  const username = "User_" + Math.floor(Math.random() * 1000);
  const noChatsLeft =
  connected &&
  state?.chats_left !== undefined &&
  state.chats_left <= 0;


  useEffect(() => {
    fetch("/api/socket");
    const socket = socketRef.current;
    socket.emit("user:identify", { username });

    socket.on("match:searching", (delay: number) => setSearchingText(`Searching...`));
    socket.on("chat:connected", () => {
      setMessages([]);
      setConnected(true);
      setPartnerName("Random MOD NAME");
      setSearchingText(null);
    });
    socket.on("chat:message", (msg: string) => {
      setMessages((prev) => [...prev, { id: Date.now(), sender: "them", text: msg }]);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop:typing", () => setIsTyping(false));
    socket.on("chat:ended", () => { setConnected(false); setPartnerName(null); });
    socket.on("no-mod-available", () => { alert("No mods available"); setSearchingText(null); });

    return () => { socket.off(); };
  }, []);

  useEffect(() => {
    if (searchingText === null) { setSeconds(1); return; }
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [searchingText]);

  const handleInputChange = (value: string) => {
    setInput(value);
    if (!connected) return;
    socketRef.current.emit("typing");
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socketRef.current.emit("stop:typing"), 800);
  };

  const sendMessage = async() => {
    if (!input.trim() || !connected) return;
    if (noChatsLeft) {
      return;
    }
    socketRef.current.emit("chat:message", input);
    socketRef.current.emit("stop:typing");
    setMessages((prev) => [...prev, { id: Date.now(), sender: "me", text: input }]);
    const success = await decreaseChat();
    setInput("");
  };

  const nextChat = () => {
    // 1. Clear UI state immediately so the user knows the transition started
    setMessages([]);
    setConnected(false);
    setPartnerName(null);
    setSearchingText('Searching...')
  
    // 2. Get the delay from plan context (e.g., 90s for Free, 15s for Basic, 0s for Premium)
    // Convert seconds to milliseconds
    const delay = (state?.min_match_time? state.min_match_time:0) * 1000;
  
    // 3. Optional: Set a searching state so the UI can show a countdown/spinner
    // setSearchingText(`Searching... (Wait ${state?.min_match_time}s)`);
  
    setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("chat:next");
        socketRef.current.emit("user:next");
      }
    }, delay);
  };
 
  return (
    <div className="h-dvh bg-[#0b0f1a] text-white flex flex-col">
      <ChatHeader connected={connected} partnerName={partnerName} searchingText={searchingText} />
      
      <MessageList 
        messages={messages} 
        isTyping={isTyping} 
        partnerName={partnerName} 
        searchingText={searchingText} 
        seconds={seconds} 
        connected={connected} 
      />

      <ChatControls 
        input={input}
        connected={connected}
        searchingText={searchingText}
        onInputChange={handleInputChange}
        onSendMessage={sendMessage}
        onNext={nextChat}
        onExit={() => { socketRef.current.emit("chat:next"); setConnected(false); setMessages([]); }}
        onLogout={async () => { await signOut(); redirect("/login"); }}
      />
    </div>
  );
}