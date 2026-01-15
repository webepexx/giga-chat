"use client";

import { ArrowBigRight, Video, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiInput from "@/components/ui/emoji-input";
import { usePlan } from "@/contexts/PlanContext";
import { useEffect, useState } from "react";

interface ChatControlsProps {
  input: string;
  connected: boolean;
  searchingText: string | null;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
  onNext: () => void;
  onExit: () => void;
  onLogout: () => void;
}

export default function ChatControls({
  input,
  connected,
  searchingText,
  onInputChange,
  onSendMessage,
  onNext,
  onExit,
  onLogout,
}: ChatControlsProps) {
  const { state } = usePlan();

  // Per-message cooldown (seconds)
  const [cooldown, setCooldown] = useState(0);

  // Countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  // Send handler with cooldown logic
  const handleSend = () => {
    if (!connected) return;

    // Block if cooldown active (except unlimited)
    if (state?.chat_timer !== 0 && cooldown > 0) return;

    onSendMessage();

    // Start cooldown AFTER sending
    if (state?.chat_timer && state.chat_timer > 0) {
      setCooldown(state.chat_timer);
    }
  };

  return (
    <div className="border-t border-white/5 p-4 bg-[#0e1326]">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-2">
          {connected ? (
            <>
              <Button variant="secondary" size="sm" onClick={onExit}>
                Exit
              </Button>
              <Button size="sm" onClick={onNext}>
                Next
              </Button>
            </>
          ) : (
            <Button
              onClick={onNext}
              disabled={searchingText !== null}
              className="bg-indigo-600 hover:bg-indigo-500 px-8"
            >
              Start Chat
            </Button>
          )}
        </div>

        {/* Cooldown Indicator */}
        {connected && state?.chat_timer !== 0 && (
          <div className="text-xs text-white/40 font-mono">
            Slow mode: {state?.chat_timer}s
          </div>
        )}
        {connected && state?.chat_timer === 0 && (
          <div className="text-xs text-indigo-400 font-mono">
            ∞ Unlimited
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (cooldown === 0 || state?.chat_timer === 0) {
                  handleSend();
                }
              }
            }}
            disabled={!connected}
            placeholder={
              connected ? "Type a message..." : "Connect to start chatting"
            }
            className="w-full bg-[#0b0f1a] border border-white/10 rounded-xl px-4 py-3 outline-none disabled:opacity-40"
          />

          {/* Feature buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {state?.can_send_gifs && (
              <button className="text-white/40 hover:text-white">
                <Gift size={18} />
              </button>
            )}
            {state?.can_send_videos && (
              <button className="text-white/40 hover:text-white">
                <Video size={18} />
              </button>
            )}
            {state?.can_send_emojis && (
              <EmojiInput
                value={input}
                onChange={onInputChange}
                disabled={!connected}
              />
            )}
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={
            !connected ||
            (state?.chat_timer !== 0 && cooldown > 0)
          }
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition-colors min-w-[64px]"
        >
          {state?.chat_timer !== 0 && cooldown > 0 ? (
            <span className="text-sm font-mono">{cooldown}s</span>
          ) : (
            <ArrowBigRight />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="text-xs text-white/20 hover:text-white/60 transition-colors ml-2"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
