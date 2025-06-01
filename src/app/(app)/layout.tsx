
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

  // State for user's display name and avatar, managed by this layout
  const [currentUserName, setCurrentUserName] = useState("Pixel User");
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/60x60.png");
  
  const [isEditingNameInSidebar, setIsEditingNameInSidebar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [userXP, setUserXP] = useState(1250);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // This useEffect updates the layout's state when the Firebase user object changes
  useEffect(() => {
    if (user) {
      setCurrentUserName(user.displayName || user.email || "Pixel User");
      if (user.photoURL) {
        setUserAvatar(user.photoURL);
      } else {
        setUserAvatar("https://placehold.co/60x60.png");
      }
    }
    // No 'else' here to reset, to prevent accidental resets if 'user' flickers.
    // The redirect logic above and authLoading check should handle states where there's no user.
  }, [user]); // Re-run when the user object itself changes


  const handleAvatarClick = () => {
    if (isEditingNameInSidebar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarChangeInSidebar = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string); // Updates state in AppLayout
        // TODO: If user is logged in, offer to save this to their Firebase profile
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserNameSaveInSidebar = (newName: string) => {
    const finalName = newName.trim() === "" ? (user?.email || "Pixel User") : newName.trim();
    setCurrentUserName(finalName); // Updates state in AppLayout
    setIsEditingNameInSidebar(false);
    // TODO: If user is logged in, offer to save this
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
    // Reset local state on logout to defaults
    setCurrentUserName("Pixel User");
    setUserAvatar("https://placehold.co/60x60.png");
    setUserXP(0); 
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
  
  if (!user && (pathname === '/login' || pathname === '/signup')) {
     // If user is not logged in and on login/signup page, don't render the main layout
     // The login/signup pages will render themselves via the children prop
     return <>{children}</>; 
  }
  
  if (!user) return null; // Should be covered by redirect, but as a fallback

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
                src={userAvatar} // Uses state from AppLayout
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
                  defaultValue={currentUserName} // Uses state from AppLayout
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
                // Pass XP state
                userXP, 
                setUserXP, 
                // Pass current user name and avatar (values)
                layoutUserName: currentUserName, 
                layoutUserAvatar: userAvatar,
                // Pass setters for name and avatar, so children can update AppLayout's state
                setLayoutUserName: setCurrentUserName,
                setLayoutUserAvatar: setUserAvatar,
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
