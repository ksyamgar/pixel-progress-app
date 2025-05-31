
"use client";

import type { ReactNode } from 'react';
import { useState, useRef } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import { LogOut, UploadCloud } from 'lucide-react';
import Image from 'next/image';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/100x100.png");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-border/30">
        <SidebarHeader className="p-2 items-center justify-center flex flex-col">
           <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Image 
              src={userAvatar} 
              alt="User Avatar" 
              data-ai-hint="pixel game logo" 
              width={60} 
              height={60} 
              className="rounded-full border-2 border-primary mb-1 group-data-[collapsible=icon]:hidden object-cover" 
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity group-data-[collapsible=icon]:hidden">
              <UploadCloud className="h-5 w-5 text-white/80" />
            </div>
          </div>
          <input 
            type="file" 
            ref={avatarInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
           <div className="font-pixel text-base font-bold text-primary group-data-[collapsible=icon]:hidden">Pixel User</div>
        </SidebarHeader>
        <SidebarContent className="p-1">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-1">
          <Button variant="ghost" className="w-full justify-start font-mono text-sidebar-foreground hover:bg-primary/20 hover:text-accent-foreground group-data-[collapsible=icon]:justify-center h-8 text-xs">
            <LogOut className="mr-1.5 h-3.5 w-3.5 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-1.5 md:p-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
