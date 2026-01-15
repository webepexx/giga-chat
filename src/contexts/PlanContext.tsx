"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';

interface PlanLimitations {
  planName: string;
  pfp_edit: boolean;
  name_edit: boolean;
  can_send_gifs: boolean;
  can_send_videos: boolean; // New
  can_send_emojis: boolean;
  chat_cooldown: number;
  chats_left: number;
  chat_timer: number; // New: 0 means no timer
  max_friend_req: number; // New
  min_match_time: number;
}

interface PlanContextType {
  state: PlanLimitations | null;
  loading: boolean;
  getSearchCooldown: () => number;
  refreshPlan: () => Promise<void>;
  decreaseChat: () => Promise<boolean>;
}


const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlanLimitations | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserPlan = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/plan-details');
      // const response2 = await fetch('/api/user');
      const data = await response.json();

      if (data.success) {
        const planData: PlanLimitations = {
          planName: data.planName,
          pfp_edit: data.limitations.pfp_edit,
          name_edit: data.limitations.name_edit,
          can_send_gifs: data.limitations.can_send_gifs,
          can_send_videos: data.limitations.can_send_videos,
          can_send_emojis: data.limitations.can_send_emojis,
          chat_cooldown: data.limitations.chat_cooldown,
          chats_left: data.limitations.chats_left,
          chat_timer: data.limitations.chat_timer,
          max_friend_req: data.limitations.max_friend_req,
          min_match_time: data.limitations.min_match_time,
        };

        setState(planData);
        Cookies.set('user_plan_v3', JSON.stringify(planData), { expires: 1 });
      }
    } catch (error) {
      console.error("Plan Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSearchCooldown = useCallback(() => {
    if (!state) return 5000;
    const base = state.min_match_time * 1000;
    // Logic: min_match_time + random(2 to 20 seconds)
    const randomOffset = (Math.floor(Math.random() * (20 - 2 + 1)) + 2) * 1000;
    return base + randomOffset;
  }, [state]);

  const decreaseChat = useCallback(async () => {
    if (!state || state.chats_left <= 0) return false;
  
    // 🔥 Optimistic update
    setState((prev) =>
      prev
        ? {
            ...prev,
            chats_left: Math.max(prev.chats_left - 1, 0),
          }
        : prev
    );
  
    try {
      const res = await fetch("/api/user", {
        method: "POST",
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.success) {
        throw new Error("Failed to decrease chat");
      }
  
      // Sync with server response (authoritative)
      setState((prev) =>
        prev
          ? {
              ...prev,
              chats_left: data.chats_left,
            }
          : prev
      );
  
      Cookies.set(
        "user_plan_v3",
        JSON.stringify({
          ...state,
          chats_left: data.chats_left,
        }),
        { expires: 1 }
      );
  
      return true;
    } catch (error) {
      console.error("Chat decrease failed:", error);
  
      // Rollback on failure
      setState((prev) =>
        prev
          ? {
              ...prev,
              chats_left: prev.chats_left + 1,
            }
          : prev
      );
  
      return false;
    }
  }, [state]);
  

  useEffect(() => {
    const saved = Cookies.get('user_plan_v3');
    if (saved) {
      setState(JSON.parse(saved));
      setLoading(false);
    } else {
      fetchUserPlan();
    }
  }, [fetchUserPlan]);

  return (
    <PlanContext.Provider value={{ state, loading, getSearchCooldown, refreshPlan: fetchUserPlan, decreaseChat }}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within PlanProvider");
  return context;
};