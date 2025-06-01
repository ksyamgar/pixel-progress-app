
"use client";

import type { ReactNode } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

function MainAppLayoutContent({ children }: { children: ReactNode }) {
  const { state, openMobile, isMobile, toggleSidebar, setOpenMobile } = useSidebar();
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [userAvatar, setUserAvatar] = useState("https://placehold.co/60x60.png");
  const [currentUserName, setCurrentUserName] = useState("Pixel User");
  const [isEditingNameInSidebar, setIsEditingNameInSidebar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [userXP, setUserXP] = useState(1250);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setCurrentUserName(user.displayName || user.email || "Pixel User");
      if (user.photoURL) setUserAvatar(user.photoURL);
      else setUserAvatar("https://placehold.co/60x60.png");
    } else {
      setCurrentUserName("Pixel User");
      setUserAvatar("https://placehold.co/60x60.png");
    }
  }, [user]);


  const handleAvatarClick = () => {
    if (isEditingNameInSidebar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChangeInSidebar = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
        // TODO: If user is logged in, offer to save this to their Firebase profile
        // if (user) { user.updateProfile({ photoURL: reader.result as string }); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserNameSaveInSidebar = (newName: string) => {
    const finalName = newName.trim() === "" ? (user?.email || "Pixel User") : newName.trim();
    setCurrentUserName(finalName);
    setIsEditingNameInSidebar(false);
    // TODO: If user is logged in, offer to save this (user.updateProfile({displayName: finalName}))
    // if (user) { user.updateProfile({ displayName: finalName }); }
  };

  const handleUserNameKeyDownInSidebar = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleUserNameSaveInSidebar((event.target as HTMLInputElement).value);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      setIsEditingNameInSidebar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && pathname !== '/login' && pathname !== '/signup') {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-foreground">Redirecting to login...</p>
            <LoadingSpinner size="md" />
        </div>
    );
  }
  
  if (!user) return null;

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-border/30 text-xs">
        <SidebarHeader className="p-1.5">
          <div className="flex justify-end items-center w-full mb-1 group-data-[collapsible=icon]:hidden">
            {state === 'expanded' && !isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-sidebar-foreground hover:text-accent-foreground">
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
            )}
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
              onChange={handleAvatarChangeInSidebar}
              accept="image/*"
              className="hidden"
            />
             <div className="flex items-center gap-0.5 mt-0.5 group-data-[collapsible=icon]:hidden">
              {isEditingNameInSidebar ? (
                <Input
                  type="text"
                  defaultValue={currentUserName}
                  onBlur={(e) => handleUserNameSaveInSidebar(e.target.value)}
                  onKeyDown={handleUserNameKeyDownInSidebar}
                  autoFocus
                  className="font-pixel text-sm h-6 bg-card/70 border-primary/50 text-primary text-center"
                  style={{ minWidth: '80px', maxWidth: '120px' }}
                />
              ) : (
                <div className="font-pixel text-sm font-bold text-primary truncate max-w-[120px]">{currentUserName}</div>
              )}
              {!isEditingNameInSidebar && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingNameInSidebar(true)} className="h-5 w-5 p-0.5">
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
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start font-mono text-sidebar-foreground hover:bg-primary/20 hover:text-accent-foreground group-data-[collapsible=icon]:justify-center h-7 text-xs">
            <LogOut className="mr-1.5 h-3 w-3 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
        <Header userName={currentUserName} userXP={userXP} />
        <main className="flex-1 overflow-y-auto max-sm:p-1.5 sm:p-2.5 md:p-3.5">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // @ts-ignore
              return React.cloneElement(child, { 
                userXP, 
                setUserXP, 
                userName: currentUserName, // Prop for displaying name
                userAvatar,               // Prop for displaying avatar
                setUserAvatar,            // Setter for avatar
                setAppUserName: setCurrentUserName, // Setter for application-wide user name
               });
            }
            return child;
          })}
        </main>
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <MainAppLayoutContent>{children}</MainAppLayoutContent>
    </SidebarProvider>
  );
}
