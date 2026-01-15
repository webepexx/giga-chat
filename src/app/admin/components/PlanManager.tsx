'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlanManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/plans');
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleUpdate = async (plan: any) => {
    setUpdatingId(plan.id);
    await fetch('/api/admin/plans', {
      method: 'PATCH',
      body: JSON.stringify(plan),
    });
    setUpdatingId(null);
  };

  const handleChange = (id: string, field: string, value: any) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (loading) return <div className="p-6 text-white/50">Loading Plans...</div>;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Subscriptions</h2>
        <Button size="sm" className='hover:bg-indigo-700' onClick={fetchPlans}><RefreshCw size={14} className="mr-2 "/> Sync</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-[#0f1424] border-white/10 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                {plan.name}
                <span className="text-indigo-400">₹{plan.price}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-white/40">Pricing & Limits</label>
                <div className="grid grid-cols-2 gap-2">
                  <InputGroup label="Price" value={plan.price} onChange={(v:any) => handleChange(plan.id, 'price', Number(v))} />
                  <InputGroup label="Daily Chats" value={plan.maxDailyChats} onChange={(v:any) => handleChange(plan.id, 'maxDailyChats', Number(v))} />
                  <InputGroup label="Timer (s)" value={plan.chatTimer} onChange={(v:any) => handleChange(plan.id, 'chatTimer', Number(v))} />
                  <InputGroup label="Match Delay" value={plan.minMatchTime} onChange={(v:any) => handleChange(plan.id, 'minMatchTime', Number(v))} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase text-white/40">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  <ToggleGroup label="Emojis" active={plan.sendEmojis} onClick={() => handleChange(plan.id, 'sendEmojis', !plan.sendEmojis)} />
                  <ToggleGroup label="GIFs" active={plan.sendGifs} onClick={() => handleChange(plan.id, 'sendGifs', !plan.sendGifs)} />
                  <ToggleGroup label="Videos" active={plan.sendVideos} onClick={() => handleChange(plan.id, 'sendVideos', !plan.sendVideos)} />
                  <ToggleGroup label="Name Edit" active={plan.editName} onClick={() => handleChange(plan.id, 'editName', !plan.editName)} />
                </div>
              </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-500 mt-2" 
                onClick={() => handleUpdate(plan)}
                disabled={updatingId === plan.id}
              >
                {updatingId === plan.id ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: any) {
  return (
    <div className="bg-[#0b0f1a] p-2 rounded border border-white/5">
      <p className="text-[10px] text-white/40">{label}</p>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent outline-none w-full text-sm font-mono" />
    </div>
  );
}

function ToggleGroup({ label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center justify-between p-2 rounded border text-xs transition-colors ${active ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5 bg-[#0b0f1a]'}`}>
      {label}
      {active ? <Check size={12} className="text-indigo-400" /> : <X size={12} className="text-white/20" />}
    </button>
  );
}