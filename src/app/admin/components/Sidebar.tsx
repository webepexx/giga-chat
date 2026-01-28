'use client';

import { LayoutDashboard, Users, Shield, Settings, Gift } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signOut } from 'next-auth/react';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'mods', label: 'Mods', icon: Shield },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'plans', label: 'Plans', icon: Gift },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: any) {
  return (
    <aside className={clsx(
      'fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1424] border-r border-white/10 transition-transform',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:relative lg:translate-x-0'
    )}>
      <div className="p-4 text-xl font-semibold italic">
        Spark<span className="text-indigo-400">Admin</span>
      </div>
      <Separator className="bg-white/10" />

      <nav className="p-4 flex flex-col h-[calc(100vh-65px)] justify-between">
        <div className="flex flex-col gap-1">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={clsx(
                "flex justify-start gap-3",
                activeTab === id
                  ? "bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500 rounded-none hover:bg-indigo-700 hover:text-white"
                  : "text-white/60 hover:text-white hover:bg-indigo-800"
              )}
            >
              <Icon size={18} />
              {label}
            </Button>
          ))}
        </div>

        <Button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="hover:bg-red-500/10 hover:text-red-400"
        >
          Log Out
        </Button>
      </nav>
    </aside>
  );
}
