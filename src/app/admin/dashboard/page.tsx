'use client';

import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Gift,
  Menu,
  Bell,
  IndianRupee,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Mods', icon: Shield },
  { label: 'Users', icon: Users },
  { label: 'Settings', icon: Settings },
  { label: 'Plans', icon: Gift },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex bg-[#0b0f1a] text-white overflow-hidden">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-2 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-[#0f1424] border-r border-white/10 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0'
        )}
      >
        <div className="p-4 text-xl font-semibold">
          Spark<span className="text-indigo-400">Admin</span>
        </div>

        <Separator className="bg-white/10" />

        <nav className="p-6 flex flex-col gap-2">
          {sidebarItems.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              variant="ghost"
              className="flex pr-2 justify-start gap-3 text-white/70 hover:text-white"
            >
              <Icon size={18} />
              {label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 h-full">

        {/* HEADER */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-6 bg-[#0e1326] border-b border-white/10">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </Button>
            <span className="font-medium">Admin Dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost">
              <Bell />
            </Button>
            <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 overflow-hidden h-[50%]">

          {/* TOP STATS */}
          <div className="flex gap-3 flex-1 min-h-0">
            <StatCard
              title="Gifts Received"
              value="₹1,24,500"
              subtitle="Amount received for media"
              icon={<Gift className="text-indigo-400" />}
            />
            <StatCard
              title="Premium Users"
              value="342 / 1240"
              subtitle="Basic + Premium / Total"
              icon={<Users className="text-indigo-400" />}
            />
            <StatCard
              title="Recurring Payments"
              value="₹78,000"
              subtitle="Monthly revenue"
              icon={<IndianRupee className="text-indigo-400" />}
            />
          </div>
          <Card className="bg-[#0f1424] border-white/10 flex flex-col w-full">
              <CardContent className="p-4 flex-1 text-center">
                <p className="text-2xl font-semibold text-white">Active Chats</p>
                <p className="text-white/80 mt-2">List of users</p>
              </CardContent>
            </Card>
          {/* BOTTOM SECTION */}
          <div className="flex gap-3 flex-1 min-h-0">

            {/* USERS */}
            <Card className="bg-[#0f1424] border-white/10 flex flex-col w-full">
              <CardContent className="p-4 flex-1">
                <p className="text-2xl font-semibold text-white">Users</p>
                <p className="text-white/80 mt-2">List of users</p>
              </CardContent>
            </Card>

            {/* MODS */}
            <Card className="bg-[#0f1424] border-white/10 flex flex-col w-full">
              <CardContent className="p-4 flex-1">
                <p className="text-2xl text-white font-semibold">Mods</p>
                <p className="text-white/80 mt-2">List of mods</p>
              </CardContent>
            </Card>

            {/* PLANS */}
            <Card className="bg-[#0f1424] border-white/10 flex flex-col w-full">
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-2xl text-white font-semibold">Plans</p>
                  <p className="text-white/80 mt-2">
                    Free · Basic · Premium
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Click to edit price & features
                  </p>
                </div>

                <Button className="bg-indigo-600 hover:bg-indigo-500 mt-4">
                  Edit Plans
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}

/* ===== STAT CARD ===== */
function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-[#0f1424] border-white/10 w-full">
      <CardContent className="p-4 flex justify-center items-center h-full">
        <div>
          <p className="text-sm text-white/50">{title}</p>
          <p className="text-2xl text-white font-semibold mt-1">{value}</p>
          <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}
