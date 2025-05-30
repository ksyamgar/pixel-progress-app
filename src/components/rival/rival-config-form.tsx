
"use client";

import { useState, useEffect } from 'react';
import type { AIRival, XPGainRuleId } from "@/lib/types";
import { XP_GAIN_RULES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/shared/glass-card";
import { Save, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


// Mock initial rival data
const initialRivalData: AIRival = {
  xp: 1100, // This would likely come from a shared state or backend
  xpGainRule: 'hourly',
  xpGainValue: 10,
};

export function RivalConfigForm() {
  const [rivalConfig, setRivalConfig] = useState<AIRival>(initialRivalData);
  const { toast } = useToast();

  // In a real app, you'd fetch this or get from context
  useEffect(() => {
    // const fetchedConfig = await getRivalConfigFromAI(); // Placeholder
    // setRivalConfig(fetchedConfig);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRivalConfig(prev => ({ ...prev, [name]: name === 'xpGainValue' ? parseInt(value) || 0 : value }));
  };

  const handleRuleChange = (value: XPGainRuleId) => {
    setRivalConfig(prev => ({ ...prev, xpGainRule: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call AI flow to save config: await updateAIRivalConfig(rivalConfig); // Placeholder
    console.log("Saving AI Rival Config:", rivalConfig);
    toast({
      title: "AI Rival Config Saved!",
      description: `Rule: ${rivalConfig.xpGainRule}, Value: ${rivalConfig.xpGainValue}`,
      className: "glassmorphic font-mono border-accent text-foreground",
    });
  };

  return (
    <GlassCard className="max-w-lg mx-auto font-mono">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-pixel text-primary">Configure AI Rival</h2>
        </div>
        
        <div>
          <Label htmlFor="xpGainRule" className="text-primary-foreground/80">XP Gain Rule</Label>
          <Select value={rivalConfig.xpGainRule} onValueChange={handleRuleChange}>
            <SelectTrigger id="xpGainRule" className="w-full bg-card/50 border-primary/30">
              <SelectValue placeholder="Select XP gain rule" />
            </SelectTrigger>
            <SelectContent className="glassmorphic">
              {XP_GAIN_RULES.map(rule => (
                <SelectItem key={rule.id} value={rule.id} className="hover:bg-primary/20 focus:bg-primary/20">{rule.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="xpGainValue" className="text-primary-foreground/80">
            {rivalConfig.xpGainRule === 'percentageOfUserMissed' ? 'Percentage Value (%)' : 'XP Value'}
          </Label>
          <Input
            id="xpGainValue"
            name="xpGainValue"
            type="number"
            value={rivalConfig.xpGainValue}
            onChange={handleChange}
            required
            className="bg-card/50 border-primary/30 focus:border-accent"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/80 font-semibold">
            <Save className="mr-2 h-5 w-5" /> Save Configuration
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground p-3 rounded-md bg-card/30 border border-border/20">
          <p><strong className="text-accent">Hourly:</strong> Rival gains fixed XP every hour.</p>
          <p><strong className="text-accent">Percentage of User's Missed XP:</strong> Rival gains a percentage of XP from your incomplete/failed tasks.</p>
          <p><strong className="text-accent">Daily Flat Rate:</strong> Rival gains a fixed amount of XP daily, regardless of activity.</p>
        </div>
      </form>
    </GlassCard>
  );
}

    