
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Gamepad2, ShieldHalf, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AIRival } from "@/lib/types";

// Initial XP for the user. Name will come from props.
const initialRival: AIRival = { xp: 1100, xpGainRule: 'hourly', xpGainValue: 10 };

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const [rival, setRival] = useState<AIRival>(initialRival);
  const [userXP, setUserXP] = useState(1250); // Kept for demo, ideally from global state

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulating XP gain for rival for demo
      setRival(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 2) })); 
    }, 7000); 
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-40 w-full glassmorphic rounded-b-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-0.5 sm:px-1 md:px-1.5">
        {/* Left side: Sidebar Trigger + App Title */}
        <div className="flex items-center min-w-0">
          <SidebarTrigger className="md:hidden mr-0.5 sm:mr-1 text-primary-foreground hover:text-accent h-7 w-7" />
          <Link href="/" className="flex items-center space-x-0.5 sm:space-x-1 min-w-0">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary font-pixel shrink-0" />
            <span className="font-pixel text-lg sm:text-xl font-bold text-primary-foreground tracking-tighter max-[359px]:hidden">
              Pixel Progress
            </span>
          </Link>
        </div>

        {/* Right side: User XP + Rival XP */}
        <div className="flex items-center space-x-0.5 md:space-x-1 min-w-0">
          {/* User XP Block */}
          <div className="flex items-center max-[319px]:space-x-0.5 space-x-1 max-[319px]:px-1 max-[319px]:py-0.5 px-1.5 py-1 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30 min-w-0">
            <UserCircle className="max-[319px]:h-3 max-[319px]:w-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
            <div className="font-mono text-[0.6rem] sm:text-xs font-medium text-primary-foreground flex items-center min-w-0">
              <span className="truncate max-[319px]:max-w-[3ch] max-sm:max-w-[5ch] sm:max-w-[8ch] md:max-w-[12ch]">{userName}</span>
              <span className="ml-0.5 whitespace-nowrap sm:inline">: {userXP} XP</span>
            </div>
            <Zap className="max-[319px]:h-2.5 max-[319px]:w-2.5 h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 shrink-0" />
          </div>

          {/* Rival XP Block (sm:flex) */}
          <div className="hidden sm:flex items-center space-x-1 px-1.5 py-1 rounded-md bg-destructive/20 backdrop-blur-sm border border-destructive/30 min-w-0">
            <ShieldHalf className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0" />
            <div className="font-mono text-[0.6rem] sm:text-xs font-medium text-primary-foreground flex items-center min-w-0">
              <span className="truncate max-w-[5ch] sm:max-w-[7ch]">AI Rival</span>
              <span className="ml-0.5 whitespace-nowrap sm:inline">: {rival.xp} XP</span>
            </div>
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-400 shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
