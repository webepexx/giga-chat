'use client'

import { ChevronDown, Flag, Sparkles, VenusAndMarsIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { useState } from 'react'
import GenderSelector from './GenderSelector'
import PremiumModal from './Modal'
import { usePlan } from '@/contexts/PlanContext'

const IdleUI = ({ chatStatus }: { chatStatus: string }) => {
  const [checked, setChecked] = useState(true)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [report, setReport] = useState("Report")
  const { state } = usePlan();

  return (
    <>
      <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">

        {/* STATUS */}
        <div className="text-center space-y-2">
          {/* <p className="text-lg font-medium text-white flex items-center justify-center gap-2">
            {chatStatus === "partner_skipped"
              ? "💔 Your chat partner has skipped this chat."
              : (chatStatus === "me_skipped" ? "💔 You have skipped this chat." : "")}
          </p> */}
          {/* {
            chatStatus == "partner_skipped" &&
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 border-none px-4 h-8"
              onClick={() => setReport("Reported")}
            >
              <Flag className="w-3 h-3 mr-2" /> {report}
            </Button>
          } */}
        </div>

        {/* SETTINGS */}
        <div className="w-full max-w-sm space-y-3">

          {/* INTERESTS */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-medium">
                Interests <span className={`${checked ? "text-green-400" : "text-red-400"} text-sm ml-1`}>{checked ? "(ON)" : "(OFF)"}</span>
              </span>
            </div>
            {/* <Switch defaultChecked={checked} onClick={()=>setChecked((prev)=>!prev)} className='bg-indigo-500'/> */}
            <Switch
              defaultChecked={checked}
              onClick={()=>setChecked((prev) => !prev)}
              className={`rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            />
          </div>

          {/* GENDER FILTER */}
          {/* <div
            onClick={() => setOpen(v => !v)}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <VenusAndMarsIcon className="w-5 h-5 text-purple-400" />
              </div>
              <span className="font-medium">Gender Filter</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-white/40 transition-transform ${open ? 'rotate-180' : ''
                }`}
            />
          </div> */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 animate-in fade-in zoom-in duration-200">
            <GenderSelector />
          </div>

          {/* PREMIUM CTA */}
          {state?.planName !== "Premium" && (
            <div className="text-center py-2">
              <p className="text-sm text-yellow-200/80 mb-4 px-4 leading-relaxed">
                Get premium to unlock the gender filter and media sharing! 🎉
              </p>
              <Button
                onClick={() => setPremiumOpen(true)}
                className="w-full py-6 rounded-xl text-lg font-bold shadow-lg shadow-orange-500/20 bg-linear-to-r from-orange-500 via-rose-500 to-amber-500 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <Sparkles className="w-5 h-5 mr-2" /> UPGRAGE PLAN
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PREMIUM MODAL */}
      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
      />
    </>
  )
}

export default IdleUI
