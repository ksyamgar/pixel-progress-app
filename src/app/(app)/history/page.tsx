
"use client";

import { useState } from 'react';
import type { Task } from "@/lib/types";
import { CalendarView } from "@/components/history/calendar-view";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, History, PlusCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock historical tasks
const mockHistoricalTasks: Task[] = [
  { id: "h1", title: "Old Project Deadline", xp: 100, isCompleted: true, subTasks: [], createdAt: "2024-05-10T10:00:00Z", dueDate: "2024-05-10", category: "work" },
  { id: "h2", title: "Learn Basic Spanish", xp: 150, isCompleted: false, subTasks: [], createdAt: "2024-05-15T10:00:00Z", dueDate: "2024-05-25", category: "study" },
  { id: "h3", title: "Fix Leaky Faucet", xp: 20, isCompleted: true, subTasks: [], createdAt: "2024-06-01T10:00:00Z", dueDate: "2024-06-01", category: "chore" },
  { id: "h4", title: "Run 5k", xp: 50, isCompleted: true, subTasks: [], createdAt: "2024-07-23T12:00:00.000Z", dueDate: "2024-07-23", category: "fitness" },
  { id: "h5", title: "Grocery Shopping", xp: 15, isCompleted: true, subTasks: [], createdAt: "2024-07-26T12:00:00.000Z", dueDate: "2024-07-26", category: "chore" },
];

export default function HistoryPage() {
  const [allTasks, setAllTasks] = useState<Task[]>(mockHistoricalTasks); // This would include current and past tasks
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // This function would typically add the task to the current day's list or a main task list.
  // For demonstration, we'll just toast. In a real app, this would interact with the Goals state.
  const handleReviveTask = (task: Task) => {
    console.log("Reviving task:", task.title);
    // Example: Add to a global task list or today's tasks
    // For now, just show a notification
    toast({
      title: "Quest Added to Today!",
      description: `"${task.title}" is ready for you to conquer again.`,
      className: "glassmorphic font-mono border-accent text-foreground",
    });
    // Potentially navigate to goals page or update a shared state
    // setTasks(prev => [...prev, revivedTask]); // If this page also manages active tasks
  };
  
  const filteredTasks = allTasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


  return (
    <div className="space-y-6 font-mono">
      <GlassCard className="p-4 md:p-6">
        <h1 className="text-3xl font-pixel text-primary mb-6 flex items-center">
          <CalendarDays className="mr-3 h-8 w-8" />
          Quest Archives & Calendar
        </h1>
        <p className="text-muted-foreground mb-4">
          Review your past triumphs and missed opportunities. Revive old quests to take another shot at glory!
        </p>
      </GlassCard>
      
      <CalendarView tasks={allTasks} onReviveTask={handleReviveTask} />

      <GlassCard className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-pixel text-primary flex items-center">
            <History className="mr-2 h-7 w-7" /> Reusable Quests Log
          </h2>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search past quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/50 border-primary/30 focus:border-accent"
          />
        </div>
        <ScrollArea className="h-[300px] pr-3">
          {filteredTasks.length === 0 && <p className="text-muted-foreground text-center py-4">No quests match your search, or no quests logged yet.</p>}
          <ul className="space-y-2">
            {filteredTasks.map(task => (
              <li key={task.id} className="p-3 rounded-lg bg-card/50 border border-border/30 flex justify-between items-center">
                <div>
                  <p className={`font-semibold ${task.isCompleted ? 'text-green-400' : 'text-foreground'}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">XP: {task.xp} - {task.category || 'General'}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleReviveTask(task)} className="hover:bg-primary/10 hover:text-accent">
                  <PlusCircle className="mr-2 h-4 w-4" /> Reuse Quest
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </GlassCard>
    </div>
  );
}

    
