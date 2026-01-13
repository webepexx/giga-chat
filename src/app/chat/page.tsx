'use client'

import { useEffect, useRef, useState } from "react";

const EMOJIS = ["😀", "😂", "🥲", "😍", "😎", "🤔", "🔥", "💀", "🚀", "❤️"];

type Message = {
    id: number;
    sender: "me" | "them";
    text: string;
};

export default function ChatUI() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: "them", text: "hey 👋" },
    ]);
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: "me", text: input },
        ]);
        setInput("");
    };

    return (
        <div className="h-screen w-full bg-[#0b0f1a] text-white flex overflow-hidden relative">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0f1424] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
                lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="p-4 text-xl font-semibold tracking-wide flex justify-between items-center">
                    <span>Spark<span className="text-indigo-400">Chat</span></span>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40">✕</button>
                </div>

                <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                    No chats yet
                </div>

                {/* User footer */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold">A</div>
                        <div>
                            <p className="text-sm font-medium">associate</p>
                            <p className="text-xs text-white/40">online</p>
                        </div>
                    </div>
                    <button className="text-white/40 hover:text-white">⚙️</button>
                </div>
            </aside>

            {/* Main chat */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 lg:px-6 bg-[#0e1326]">
                    <div className="flex items-center gap-3">
                        {/* Mobile Toggle Button */}
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-white/60 hover:text-white"
                        >
                            ☰
                        </button>
                        <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-pink-500 flex items-center justify-center font-bold text-sm">
                            R
                        </div>
                        <span className="font-medium truncate max-w-[120px] lg:max-w-none">@reciever</span>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4 text-white/60">
                        <button className="p-2">🔔</button>
                        <div className="hidden sm:flex h-9 w-9 rounded-full bg-indigo-500 items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`
                                max-w-[85%] lg:max-w-[60%]
                                w-fit 
                                break-words 
                                py-2 px-4 
                                rounded-2xl 
                                ${m.sender === "me" ? "bg-indigo-600 rounded-tr-none" : "bg-white/10 rounded-tl-none"}
                            `}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input bar */}
                <div className="border-t border-white/5 p-3 lg:p-4 bg-[#0e1326]">
                    <div className="flex items-center gap-2 lg:gap-3 relative">
                        <button className="hidden sm:block px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20">
                            Exit
                        </button>
                        
                        <div className="flex-1 relative">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                placeholder="Message..."
                                className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-2.5 lg:py-3 pr-10 outline-none focus:border-indigo-500 text-sm lg:text-base"
                            />

                            <button
                                onClick={() => setShowEmoji((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                            >
                                🙂
                            </button>

                            {showEmoji && (
                                <div className="absolute bottom-14 right-0 bg-[#111735] border border-white/10 rounded-xl p-2 grid grid-cols-5 gap-1 shadow-xl z-50">
                                    {EMOJIS.map((e) => (
                                        <button
                                            key={e}
                                            onClick={() => {
                                                setInput((prev) => prev + e);
                                                setShowEmoji(false);
                                            }}
                                            className="p-2 text-lg hover:scale-125 transition"
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={sendMessage}
                            className="p-2.5 lg:px-4 lg:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors"
                        >
                            <span className="hidden lg:inline">Send</span>
                            <span className="lg:hidden">➡️</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}