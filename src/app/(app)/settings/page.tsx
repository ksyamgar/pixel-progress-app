
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { RivalConfigForm } from "@/components/rival/rival-config-form";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Settings, Bot, RotateCcw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

interface SettingsPageProps {
  setUserXP?: Dispatch<SetStateAction<number>>;
}

export default function SettingsPage({ setUserXP = () => {} }: SettingsPageProps) {
  const { toast } = useToast();

  const handleFullReset = () => {
    setUserXP(0);
    // Note: This reset primarily affects global userXP.
    // Task lists on Dashboard/Goals pages are managed by their own local state.
    // Users would need to clear those manually if they want those lists emptied immediately.
    toast({
      title: "Full Progress Reset!",
      description: "Your XP has been reset to 0. Quests on dashboard/goals pages may need manual clearing.",
      variant: "destructive",
      className: "glassmorphic font-mono border-destructive text-destructive-foreground text-sm",
      duration: 5000,
    });
  };

  return (
    <div className="space-y-6 font-mono">
      <GlassCard className="p-4">
        <h1 className="text-2xl font-pixel text-primary mb-4 flex items-center">
          <Settings className="mr-2.5 h-7 w-7" />
          Application Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Customize various aspects of your Pixel Progress experience.
        </p>
      </GlassCard>

      <GlassCard className="p-4">
        <h2 className="text-xl font-pixel text-accent mb-3 flex items-center">
          <Bot className="mr-2 h-6 w-6" />
          AI Rival Configuration
        </h2>
        <RivalConfigForm />
      </GlassCard>

      <GlassCard className="p-4 border-destructive/30">
        <h2 className="text-xl font-pixel text-destructive mb-3 flex items-center">
          <AlertTriangle className="mr-2 h-6 w-6" />
          Reset Application Data
        </h2>
        <p className="text-muted-foreground text-sm mb-3">
          This action will reset your overall progress, such as your total XP, to zero.
          It will feel like starting from day zero. This cannot be undone.
          Task lists on specific pages (Dashboard, Goals) might require separate manual clearing via their respective reset options.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="w-full sm:w-auto text-xs">
              <RotateCcw className="mr-1.5 h-4 w-4" /> Reset All Progress to Day Zero
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="font-mono glassmorphic">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-pixel text-destructive">Confirm Full Reset</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                Are you absolutely sure you want to reset your XP to 0?
                This action is irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleFullReset}
                className="text-xs h-8 bg-destructive hover:bg-destructive/80"
              >
                Yes, Reset My XP
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlassCard>
    </div>
  );
}
