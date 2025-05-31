
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Gamepad2, ShieldHalf, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { UserProfile, AIRival } from "@/lib/types";

const initialUser: UserProfile = { name: "Pixel Pioneer", xp: 1250 };
const initialRival: AIRival = { xp: 1100, xpGainRule: 'hourly', xpGainValue: 10 };


export function Header() {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [rival, setRival] = useState<AIRival>(initialRival);

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 3) })); // Slower XP gain for demo
      setRival(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 2) })); // Slower XP gain for demo
    }, 7000); // Longer interval
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-40 w-full glassmorphic rounded-b-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden mr-1.5 text-primary-foreground hover:text-accent h-7 w-7" />
          <Link href="/" className="flex items-center space-x-1.5">
            <Gamepad2 className="h-7 w-7 text-primary font-pixel" />
            <span className="font-pixel text-xl font-bold text-primary-foreground tracking-tighter">
              Pixel Progress
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30">
            <UserCircle className="h-4 w-4 text-accent" />
            <span className="font-mono text-xs font-medium text-primary-foreground">
              {user.name}: {user.xp} XP
            </span>
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 p-1.5 rounded-md bg-destructive/20 backdrop-blur-sm border border-destructive/30">
            <ShieldHalf className="h-4 w-4 text-accent" />
            <span className="font-mono text-xs font-medium text-primary-foreground">
              AI Rival: {rival.xp} XP
            </span>
            <Zap className="h-3.5 w-3.5 text-red-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
