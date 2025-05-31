
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Gamepad2, ShieldHalf, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AIRival } from "@/lib/types";

const initialRival: AIRival = { xp: 1100, xpGainRule: 'hourly', xpGainValue: 10 };

interface HeaderProps {
  userName: string;
  userXP: number; // userXP is now a prop
}

export function Header({ userName, userXP }: HeaderProps) {
  const [rival, setRival] = useState<AIRival>(initialRival);

  useEffect(() => {
    const interval = setInterval(() => {
      setRival(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 2) })); 
    }, 7000); 
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-40 w-full glassmorphic rounded-b-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-1 sm:px-1.5 md:px-2">
        <div className="flex items-center min-w-0">
          <SidebarTrigger className="mr-0.5 sm:mr-1 text-primary-foreground hover:text-accent h-7 w-7 max-[319px]:h-6 max-[319px]:w-6" />
          <Link href="/" className="flex items-center space-x-0.5 sm:space-x-1 min-w-0">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary font-pixel shrink-0 max-[319px]:h-3.5 max-[319px]:w-3.5" />
            <span className="font-pixel text-lg sm:text-xl font-bold text-primary-foreground tracking-tighter">
              Pixel Progress
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-1 md:space-x-1.5 min-w-0">
          <div className="flex items-center space-x-1 px-1.5 py-1 max-[319px]:px-0.5 max-[319px]:py-0.5 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30 min-w-0">
            <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent shrink-0 max-[319px]:h-3 max-[319px]:w-3" />
            <div className="font-mono text-[0.6rem] sm:text-xs font-medium text-primary-foreground flex items-center min-w-0">
              <span className="truncate max-sm:max-w-[6ch] sm:max-w-[8ch] md:max-w-[12ch] max-[319px]:max-w-[4ch]">{userName}</span>
              <span className="ml-0.5 whitespace-nowrap sm:inline max-[319px]:hidden">: {userXP} XP</span>
            </div>
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400 shrink-0 max-[319px]:h-2.5 max-[319px]:w-2.5" />
          </div>

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
