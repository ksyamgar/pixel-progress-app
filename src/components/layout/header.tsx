
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Gamepad2, ShieldHalf, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { UserProfile, AIRival } from "@/lib/types";

// Mock data - replace with actual data fetching or state management
const initialUser: UserProfile = { name: "Pixel Pioneer", xp: 1250 };
const initialRival: AIRival = { xp: 1100, xpGainRule: 'hourly', xpGainValue: 10 };


export function Header() {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [rival, setRival] = useState<AIRival>(initialRival);

   // Simulate XP updates for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 10) }));
      setRival(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 5) }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-40 w-full glassmorphic rounded-b-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden mr-2 text-primary-foreground hover:text-accent" />
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8 text-primary font-pixel" />
            <span className="font-pixel text-2xl font-bold text-primary-foreground tracking-tighter">
              Pixel Progress
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="flex items-center space-x-2 p-2 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30">
            <UserCircle className="h-5 w-5 text-accent" />
            <span className="font-mono text-sm font-medium text-primary-foreground">
              {user.name}: {user.xp} XP
            </span>
            <Zap className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="hidden sm:flex items-center space-x-2 p-2 rounded-md bg-destructive/20 backdrop-blur-sm border border-destructive/30">
            <ShieldHalf className="h-5 w-5 text-accent" />
            <span className="font-mono text-sm font-medium text-primary-foreground">
              AI Rival: {rival.xp} XP
            </span>
            <Zap className="h-4 w-4 text-red-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

    