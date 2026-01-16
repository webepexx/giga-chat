'use client'

import { usePlan } from "@/contexts/PlanContext"
import { 
  Mars, 
  Star, 
  Venus, 
  UsersIcon, 
  VenusAndMars as VenusAndMarsIcon,
  LucideIcon 
} from "lucide-react"
import React from "react"

type Gender = "male" | "female" | "both"

interface GenderOption {
  key: Gender;
  label: string;
  emoji: LucideIcon; // Store the component reference, not the element
}

const GenderSelector = () => {
  const { state } = usePlan()

  const isFree = state?.planName === "Free"
  // Note: You'll likely want to sync this with your state/onChange later
  const selectedGender: Gender = isFree ? "both" : "male"

  const options: GenderOption[] = [
    { key: "male", label: "Male", emoji: Mars },
    { key: "both", label: "Random", emoji: UsersIcon },
    { key: "female", label: "Female", emoji: Venus },
  ]

  return (
    <div className="flex flex-col gap-3 items-center justify-center">
      {/* Header Section */}
      <div className="flex items-center gap-3 self-start pb-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <VenusAndMarsIcon className="w-5 h-5 text-purple-400" />
        </div>
        <span className="font-medium text-white text-sm">Gender Filter</span>
      </div>

      {/* Options Grid */}
      <div className="flex gap-3 items-center justify-center">
        {options.map(option => {
          const isSelected = selectedGender === option.key
          const isLocked = isFree && option.key !== "both"
          
          // Assign the component to a Capitalized variable for JSX rendering
          const IconComponent = option.emoji;

          return (
            <div
              key={option.key}
              className={`
                relative rounded-lg p-[1.5px]
                ${isSelected ? "bg-gradient-to-r from-indigo-500 to-pink-500" : "bg-transparent"}
              `}
            >
              <button
                disabled={isLocked}
                className={`
                  w-24 h-20 rounded-[8px]
                  flex flex-col items-center justify-center gap-2
                  transition-all duration-200
                  ${isSelected
                    ? "bg-[#0e1326]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"}
                  ${isLocked ? "cursor-not-allowed opacity-50 grayscale-[0.5]" : "active:scale-95"}
                `}
              >
                {/* Render the Icon Component */}
                <IconComponent 
                  size={24} 
                  className={isSelected ? "text-indigo-400" : "text-zinc-400"} 
                />
                
                <span className="text-xs font-semibold text-white">
                  {option.label}
                </span>
              </button>

              {/* Lock/Premium Badge */}
              {isLocked && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full p-1.5 shadow-xl border border-[#0e1326]">
                  <Star className="w-3 h-3 text-white" fill="currentColor" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GenderSelector