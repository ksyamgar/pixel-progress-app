
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/shared/glass-card";
import { User, Edit2, Save, UploadCloud } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface UserProfileSettingsFormProps {
  userAvatarState: string;
  setUserAvatarState: (avatar: string) => void;
  currentUserNameState: string;
  setCurrentUserNameStateGlobal: (name: string) => void; 
}

export function UserProfileSettingsForm({
  userAvatarState,
  setUserAvatarState,
  currentUserNameState,
  setCurrentUserNameStateGlobal,
}: UserProfileSettingsFormProps) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentUserNameState);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Effect to synchronize local nameInputValue with the global currentUserNameState prop
  useEffect(() => {
    setNameInputValue(currentUserNameState);
  }, [currentUserNameState]);

  const handleAvatarUploadClick = () => {
    avatarFileRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarSrc = reader.result as string;
        setUserAvatarState(newAvatarSrc); // Update global state
        toast({ title: "Avatar Updated", description: "Your new avatar is set. (Persistence not yet implemented for Firebase)", className: "glassmorphic font-mono text-xs" });
        // TODO: Persist to Firebase user.photoURL 
        // if (user) { user.updateProfile({ photoURL: newAvatarSrc }).then(() => toast({...})).catch(err => toast({...})); }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameEditToggle = () => {
    if (editingName) {
      // If currently editing, save the name
      saveName();
    } else {
      // If not editing, set the input value to the current global name before enabling edit mode
      setNameInputValue(currentUserNameState); 
    }
    setEditingName(!editingName); // Toggle editing mode
  };
  
  const saveName = () => {
    const finalName = nameInputValue.trim() === "" ? (user?.email || "Pixel User") : nameInputValue.trim();
    setCurrentUserNameStateGlobal(finalName); // Update global state
    setEditingName(false);
    toast({ title: "Display Name Updated", description: `Your name is now "${finalName}". (Persistence not yet implemented for Firebase)`, className: "glassmorphic font-mono text-xs" });
    // TODO: Persist to Firebase user.displayName
    // if (user) { user.updateProfile({ displayName: finalName }).then(() => toast({...})).catch(err => toast({...})); }
  };

  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(event.target.value);
  };
  
  const handleNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      saveName();
      event.preventDefault(); // Prevent form submission if wrapped in one
    } else if (event.key === 'Escape') {
      setEditingName(false);
      setNameInputValue(currentUserNameState); // Reset to original on escape
    }
  };

  return (
    <GlassCard className="p-4">
      <h2 className="text-xl font-pixel text-accent mb-4 flex items-center">
        <User className="mr-2 h-6 w-6" />
        User Profile
      </h2>
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-primary-foreground/80">Profile Picture</Label>
          <div className="mt-2 flex items-center gap-4 flex-wrap">
            <Image
              src={userAvatarState} // Use the global avatar state
              alt="User Avatar"
              data-ai-hint="pixel game avatar"
              width={80}
              height={80}
              className="rounded-full border-2 border-primary object-cover"
            />
            <Button variant="outline" onClick={handleAvatarUploadClick} className="text-xs h-9">
              <UploadCloud className="mr-2 h-4 w-4" /> Change Picture
            </Button>
            <input
              type="file"
              ref={avatarFileRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="displayName" className="text-sm font-medium text-primary-foreground/80">Display Name</Label>
          <div className="mt-2 flex items-center gap-2">
            {editingName ? (
              <Input
                id="displayName"
                type="text"
                value={nameInputValue} // Controlled by local state, synced with global via useEffect
                onChange={handleNameInputChange}
                onKeyDown={handleNameInputKeyDown}
                onBlur={() => { if(editingName) { /* Consider if save on blur is desired, or rely on Save button */ } }} 
                autoFocus
                className="bg-card/70 border-primary/50 text-primary h-9 flex-grow"
              />
            ) : (
              <p className="text-lg text-primary-foreground flex-grow py-1.5 px-3 rounded-md bg-card/30 border border-transparent h-9 flex items-center min-h-[36px]">
                {currentUserNameState} {/* Display global name state */}
              </p>
            )}
            <Button variant={editingName ? "default" : "outline"} onClick={handleNameEditToggle} size="sm" className="h-9">
              {editingName ? <Save className="mr-1.5 h-4 w-4" /> : <Edit2 className="mr-1.5 h-4 w-4" />}
              {editingName ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>
        
        {user && (
          <div>
            <Label className="text-sm font-medium text-primary-foreground/80">Email (Account)</Label>
            <p className="mt-2 text-muted-foreground bg-card/30 p-2 rounded-md text-sm h-9 flex items-center">
                {user.email || "No email associated"}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
