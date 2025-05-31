
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { Gamepad2, ShieldHalf, UserCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AIRival } from "@/lib/types";

// Initial XP for the user. Name will come from props.
const initialUserXP = 1250;
const initialRival: AIRival = { xp: 1100, xpGainRule: 'hourly', xpGainValue: 10 };

interface HeaderProps {
  userName: string; // Ensure userName is a prop
}

export function Header({ userName }: HeaderProps) { // Destructure and use userName prop
  const [userXP, setUserXP] = useState<number>(initialUserXP);
  const [rival, setRival] = useState<AIRival>(initialRival);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserXP(prevXP => prevXP + Math.floor(Math.random() * 3)); 
      setRival(prev => ({ ...prev, xp: prev.xp + Math.floor(Math.random() * 2) })); 
    }, 7000); 
    return () => clearInterval(interval);
  }, []);


  return (
    <header className="sticky top-0 z-40 w-full glassmorphic rounded-b-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center min-w-0">
          <SidebarTrigger className="md:hidden mr-1.5 text-primary-foreground hover:text-accent h-7 w-7" />
          <Link href="/" className="flex items-center space-x-1.5 min-w-0">
            <Gamepad2 className="h-7 w-7 text-primary font-pixel shrink-0" />
            <span className="font-pixel text-xl font-bold text-primary-foreground tracking-tighter truncate">
              Pixel Progress
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-primary/20 backdrop-blur-sm border border-primary/30 min-w-0">
            <UserCircle className="h-4 w-4 text-accent shrink-0" />
            <div className="font-mono text-xs font-medium text-primary-foreground overflow-hidden flex items-center">
              {/* Use the userName prop directly here */}
              <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[150px]">{userName}</span>
              <span className="ml-0.5">: {userXP} XP</span>
            </div>
            <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 p-1.5 rounded-md bg-destructive/20 backdrop-blur-sm border border-destructive/30 min-w-0">
            <ShieldHalf className="h-4 w-4 text-accent shrink-0" />
            <div className="font-mono text-xs font-medium text-primary-foreground overflow-hidden flex items-center">
              <span className="truncate max-w-[80px] sm:max-w-[120px]">AI Rival</span>
              <span className="ml-0.5">: {rival.xp} XP</span>
            </div>
            <Zap className="h-3.5 w-3.5 text-red-400 shrink-0" />
          </div>
        </div>
      </div>
    </header>
  );
}
