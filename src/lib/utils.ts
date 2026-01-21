import { RandomUserProfile } from "@/hooks/useModChatSocket";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const removeEmojis = (text: string) => {
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "");
}

const NAMES = ["Aarav", "Sophia", "Liam", "Noah", "Olivia", "Emma", "Mia"];
const CITIES = ["New York", "London", "Mumbai", "Berlin", "Toronto", "Paris"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomUser(): RandomUserProfile {
  const name = getRandomItem(NAMES);
  const age = Math.floor(Math.random() * (40 - 18 + 1)) + 18;

  return {
    name,
    username: `${name.toLowerCase()}_${Math.floor(Math.random() * 10000)}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    age,
    city: getRandomItem(CITIES),
  };
}
