
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, UploadCloud, Edit2, ChevronsLeft, X } from 'lucide-react';
import Image from 'next/image';

// This new inner component will render the actual layout and can safely use the useSidebar hook
function MainAppLayoutContent({ children }: { children: ReactNode }) {
  const { state, openMobile, isMobile, toggleSidebar, setOpenMobile } = useSidebar(); // Now called safely within SidebarProvider's context
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/60x60.png");
  const [userName, setUserName] = useState("Pixel User");
  const [isEditingName, setIsEditingName] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isEditingName) return;
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

  const handleUserNameSave = (newName: string) => {
    setUserName(newName.trim() === "" ? "Pixel User" : newName.trim());
    setIsEditingName(false);
  };

  const handleUserNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleUserNameSave((event.target as HTMLInputElement).value);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-border/30 text-xs">
        <SidebarHeader className="p-1.5">
          <div className="flex justify-end items-center w-full mb-1 group-data-[collapsible=icon]:hidden">
            {/* Close button for expanded sidebar on desktop */}
            {state === 'expanded' && !isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-sidebar-foreground hover:text-accent-foreground">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
            )}
             {/* Close button for open sidebar on mobile */}
            {isMobile && openMobile && (
              <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)} className="h-6 w-6 text-sidebar-foreground hover:text-accent-foreground">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Image
                src={userAvatar}
                alt="User Avatar"
                data-ai-hint="pixel game avatar"
                width={50}
                height={50}
                className="rounded-full border-2 border-primary mb-1 group-data-[collapsible=icon]:hidden object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity group-data-[collapsible=icon]:hidden">
                <UploadCloud className="h-4 w-4 text-white/80" />
              </div>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
             <div className="flex items-center gap-0.5 mt-0.5 group-data-[collapsible=icon]:hidden">
              {isEditingName ? (
                <Input
                  type="text"
                  defaultValue={userName}
                  onBlur={(e) => handleUserNameSave(e.target.value)}
                  onKeyDown={handleUserNameKeyDown}
                  autoFocus
                  className="font-pixel text-sm h-6 bg-card/70 border-primary/50 text-primary text-center"
                  style={{ minWidth: '80px', maxWidth: '120px' }}
                />
              ) : (
                <div className="font-pixel text-sm font-bold text-primary truncate max-w-[120px]">{userName}</div>
              )}
              {!isEditingName && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-5 w-5 p-0.5">
                  <Edit2 className="h-2.5 w-2.5 text-primary/70 hover:text-primary" />
                </Button>
              )}
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0.5">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-0.5">
          <Button variant="ghost" className="w-full justify-start font-mono text-sidebar-foreground hover:bg-primary/20 hover:text-accent-foreground group-data-[collapsible=icon]:justify-center h-7 text-xs">
            <LogOut className="mr-1.5 h-3 w-3 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <Header userName={userName} />
        <main className="flex-1 overflow-y-auto p-0.5 sm:p-0.5"> {/* Reduced padding */}
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen> {/* defaultOpen controls initial desktop state */}
      <MainAppLayoutContent>{children}</MainAppLayoutContent>
    </SidebarProvider>
  );
}
