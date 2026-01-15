'use client';

import { usePlan } from "@/contexts/PlanContext";

interface ChatHeaderProps {
  connected: boolean;
  partnerName: string | null;
  searchingText: string | null;
}

export default function ChatHeader({ connected, partnerName, searchingText }: ChatHeaderProps) {
  const { state, loading } = usePlan();

  const renderChatsLeft = () => {
    if (loading || !state) return "---";
    if (state.chats_left >= 1000) return "Unlimited";
    return state.chats_left;
  };

  // Logic for progress bar percentage (assuming a standard cap of 50 for free users)
  const maxChats = 50; 
  const percentage = state ? Math.min((state.chats_left / maxChats) * 100, 100) : 0;

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 bg-[#0e1326]">
      <div className="flex flex-col">
        <h1 className="font-semibold text-white">
          {connected ? `Chatting with ${partnerName}` : searchingText || "Welcome"}
        </h1>
        {connected && (
          <span className="text-[10px] text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex flex-col items-end">
        <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
          {state?.planName || "Loading..."}
        </div>
        
        <div className="text-sm font-mono text-indigo-400 flex items-center gap-2">
          <span className="text-white/60 text-xs">Chats Left:</span> 
          {renderChatsLeft()}
        </div>
 
        {/* --- PROGRESS BAR ADDED HERE --- */}
        {!loading && state && state.chats_left < 1000 && (
          <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        {/* ------------------------------- */}
      </div>
    </header>
  );
}