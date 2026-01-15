'use client';

import { LayoutDashboard, Users, Shield, Settings, Gift, Menu, Bell, IndianRupee } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signOut } from 'next-auth/react';
import PlanManager from '../components/PlanManager'; // Import the new component

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mods', label: 'Mods', icon: Shield },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'plans', label: 'Plans', icon: Gift },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" }); 
  };

  return (
    <div className="h-screen w-full flex bg-[#0b0f1a] text-white font-sans">
      {/* SIDEBAR */}
      <aside className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1424] border-r border-white/10 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0'
        )}>
        <div className="p-4 text-xl font-semibold italic tracking-tight">
          Spark<span className="text-indigo-400">Admin</span>
        </div>
        <Separator className="bg-white/10" />
        <nav className="p-4 flex flex-col h-[calc(100vh-65px)] justify-between">
          <div className='flex flex-col gap-1'>
            {sidebarItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={clsx(
                  "flex justify-start gap-3 transition-all ",
                  activeTab === id ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 rounded-none hover:bg-indigo-700 hover:text-white" : "text-white/60 hover:text-white hover:bg-indigo-800"
                )}
              >
                <Icon size={18} />
                {label}
              </Button>
            ))}
          </div>
          <Button onClick={handleLogout} className="cursor-pointer border-white/10 hover:bg-red-500/10 hover:text-red-400">Log Out</Button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* HEADER */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[#0e1326] border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu /></Button>
            <span className="font-medium text-white/80 uppercase tracking-widest text-xs">
              System / {activeTab}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="text-white/40"><Bell size={20}/></Button>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">AD</div>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'dashboard' && <DashboardOverview onEditPlans={() => setActiveTab('plans')} />}
          {activeTab === 'plans' && <PlanManager />}
          {activeTab === 'users' && <div className="text-white/40 italic">User Management coming soon...</div>}
          {activeTab === 'mods' && <div className="text-white/40 italic">Mod Controls coming soon...</div>}
        </div>
      </main>
    </div>
  );
}

/* ===== DASHBOARD COMPONENT ===== */
function DashboardOverview({ onEditPlans }: { onEditPlans: () => void }) {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value="₹1,24,500" subtitle="Media & Gifts" icon={<Gift className="text-indigo-400" />} />
        <StatCard title="Active Users" value="1,240" subtitle="342 Premium" icon={<Users className="text-indigo-400" />} />
        <StatCard title="Monthly MRR" value="₹78,000" subtitle="Recurring plans" icon={<IndianRupee className="text-indigo-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <Card className="bg-[#0f1424] border-white/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Live Activity</h3>
            <p className="text-white/40 text-sm">Monitoring 142 active socket connections...</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1424] border-white/10 flex flex-col justify-between">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <p className="text-white/40 text-sm mb-4">Update global pricing and feature gates.</p>
            <Button onClick={onEditPlans} className="bg-indigo-600 hover:bg-indigo-500 w-full">Manage Subscription Plans</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon }: any) {
  return (
    <Card className="bg-[#0f1424] border-white/10">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-white/40 font-bold uppercase tracking-tighter">{title}</p>
          <p className="text-2xl font-bold mt-1 text-white">{value}</p>
          <p className="text-[10px] text-white/30 mt-1">{subtitle}</p>
        </div>
        <div className="bg-indigo-500/10 p-3 rounded-xl">{icon}</div>
      </CardContent>
    </Card>
  );
}