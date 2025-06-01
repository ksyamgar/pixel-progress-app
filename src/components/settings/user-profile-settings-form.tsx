
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
  currentAvatarFromLayout: string;
  updateGlobalAvatar: (avatar: string) => void;
  currentNameFromLayout: string;
  updateGlobalName: (name: string) => void; 
}

export function UserProfileSettingsForm({
  currentAvatarFromLayout,
  updateGlobalAvatar,
  currentNameFromLayout,
  updateGlobalName,
}: UserProfileSettingsFormProps) {
  const { user } = useAuth(); // Get user for email display
  const { toast } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(currentNameFromLayout); // Local state for the input field
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Effect to synchronize local nameInputValue with the global currentNameFromLayout prop
  // This ensures if the name is changed via sidebar, settings form reflects it when not in edit mode
  useEffect(() => {
    if (!isEditingName) { // Only update if not actively editing to avoid disrupting user input
        setNameInputValue(currentNameFromLayout);
    }
  }, [currentNameFromLayout, isEditingName]);

  const handleAvatarUploadClick = () => {
    avatarFileRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarSrc = reader.result as string;
        updateGlobalAvatar(newAvatarSrc); // Call the setter from AppLayout
        toast({ title: "Avatar Updated", description: "Your new avatar is set locally.", className: "glassmorphic font-mono text-xs" });
        // TODO: Persist to Firebase user.updateProfile({ photoURL: newAvatarSrc })
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNameEditToggle = () => {
    if (isEditingName) {
      // If currently editing, try to save the name
      saveName();
    } else {
      // If not editing, set the input value to the current global name before enabling edit mode
      setNameInputValue(currentNameFromLayout); 
      setIsEditingName(true); // Enter edit mode
    }
  };
  
  const saveName = () => {
    const finalName = nameInputValue.trim() === "" ? (user?.email || "Pixel User") : nameInputValue.trim();
    updateGlobalName(finalName); // Call the setter from AppLayout
    setIsEditingName(false); // Exit edit mode
    toast({ title: "Display Name Updated", description: `Your name is now "${finalName}" locally.`, className: "glassmorphic font-mono text-xs" });
    // TODO: Persist to Firebase user.updateProfile({ displayName: finalName })
  };

  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameInputValue(event.target.value);
  };
  
  const handleNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      saveName();
      event.preventDefault(); 
    } else if (event.key === 'Escape') {
      setNameInputValue(currentNameFromLayout); // Reset to original on escape
      setIsEditingName(false);
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
              src={currentAvatarFromLayout} // Use the prop from AppLayout
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
            {isEditingName ? (
              <Input
                id="displayName"
                type="text"
                value={nameInputValue} 
                onChange={handleNameInputChange}
                onKeyDown={handleNameInputKeyDown}
                onBlur={() => { 
                    // To prevent saving on blur if user clicks "Save" button immediately
                    // We rely on the Save button or Enter key for explicit save
                    // If you want save on blur:
                    // if (isEditingName && nameInputValue !== currentNameFromLayout) saveName(); else setIsEditingName(false);
                }} 
                autoFocus
                className="bg-card/70 border-primary/50 text-primary h-9 flex-grow"
              />
            ) : (
              <p className="text-lg text-primary-foreground flex-grow py-1.5 px-3 rounded-md bg-card/30 border border-transparent h-9 flex items-center min-h-[36px]">
                {currentNameFromLayout} {/* Display prop from AppLayout */}
              </p>
            )}
            <Button 
              variant={isEditingName ? "default" : "outline"} 
              onClick={handleNameEditToggle} 
              size="sm" 
              className="h-9"
            >
              {isEditingName ? <Save className="mr-1.5 h-4 w-4" /> : <Edit2 className="mr-1.5 h-4 w-4" />}
              {isEditingName ? 'Save' : 'Edit'}
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
