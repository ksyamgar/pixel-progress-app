
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


const initialRivalData: AIRival = {
  xp: 1100, 
  xpGainRule: 'hourly',
  xpGainValue: 10,
};

export function RivalConfigForm() {
  const [rivalConfig, setRivalConfig] = useState<AIRival>(initialRivalData);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching data
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
    console.log("Saving AI Rival Config:", rivalConfig);
    toast({
      title: "AI Rival Config Saved!",
      description: `Rule: ${rivalConfig.xpGainRule}, Value: ${rivalConfig.xpGainValue}`,
      className: "glassmorphic font-mono border-accent text-foreground text-sm",
    });
  };

  return (
    <GlassCard className="max-w-md mx-auto font-mono">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="flex items-center space-x-2.5 mb-3">
          <Bot className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-pixel text-primary">Configure AI Rival</h2>
        </div>
        
        <div className="text-sm">
          <Label htmlFor="xpGainRule" className="text-primary-foreground/80 text-xs">XP Gain Rule</Label>
          <Select value={rivalConfig.xpGainRule} onValueChange={handleRuleChange}>
            <SelectTrigger id="xpGainRule" className="w-full bg-card/50 border-primary/30 h-9 text-sm">
              <SelectValue placeholder="Select XP gain rule" />
            </SelectTrigger>
            <SelectContent className="glassmorphic">
              {XP_GAIN_RULES.map(rule => (
                <SelectItem key={rule.id} value={rule.id} className="hover:bg-primary/20 focus:bg-primary/20 text-sm">{rule.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm">
          <Label htmlFor="xpGainValue" className="text-primary-foreground/80 text-xs">
            {rivalConfig.xpGainRule === 'percentageOfUserMissed' ? 'Percentage Value (%)' : 'XP Value'}
          </Label>
          <Input
            id="xpGainValue"
            name="xpGainValue"
            type="number"
            value={rivalConfig.xpGainValue}
            onChange={handleChange}
            required
            className="bg-card/50 border-primary/30 focus:border-accent h-9 text-sm"
          />
        </div>

        <div className="pt-1">
          <Button type="submit" size="sm" className="w-full bg-primary hover:bg-primary/80 font-semibold h-9">
            <Save className="mr-1.5 h-4 w-4" /> Save Configuration
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground p-2.5 rounded-md bg-card/30 border border-border/20 space-y-1">
          <p><strong className="text-accent">Hourly:</strong> Rival gains fixed XP every hour.</p>
          <p><strong className="text-accent">Percentage of User's Missed XP:</strong> Rival gains a % of XP from your incomplete tasks.</p>
          <p><strong className="text-accent">Daily Flat Rate:</strong> Rival gains a fixed amount of XP daily.</p>
        </div>
      </form>
    </GlassCard>
  );
}
