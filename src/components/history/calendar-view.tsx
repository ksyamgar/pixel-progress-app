
"use client";

import { useState, useMemo } from 'react';
import type { CalendarTaskEvent, Task } from '@/lib/types';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CheckCircle2, Circle, Zap, RefreshCcw } from "lucide-react";
import { format, parseISO, isSameDay, startOfMonth } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  tasks: Task[]; // All historical tasks
  onReviveTask: (task: Task) => void; // Callback to "revive" a task
}

export function CalendarView({ tasks, onReviveTask }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { toast } = useToast();

  const calendarEvents = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.dueDate || task.createdAt, // Use dueDate if available, else createdAt
      xp: task.xp,
      isCompleted: task.isCompleted,
      originalTaskId: task.id,
    }));
  }, [tasks]);

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return calendarEvents.filter(event => isSameDay(parseISO(event.date), selectedDate));
  }, [selectedDate, calendarEvents]);

  const handleRevive = (eventId: string) => {
    const taskToRevive = tasks.find(t => t.id === eventId);
    if (taskToRevive) {
      onReviveTask({...taskToRevive, dueDate: format(new Date(), 'yyyy-MM-dd'), isCompleted: false, id: String(Date.now()) }); // Revive for today
      toast({
        title: "Quest Revived!",
        description: `"${taskToRevive.title}" has been added to today's quests.`,
        className: "glassmorphic font-mono border-accent text-foreground",
      });
    }
  };
  
  const DayCellContent = ({ date }: { date: Date }) => {
    const dayTasks = calendarEvents.filter(event => isSameDay(parseISO(event.date), date));
    const completedCount = dayTasks.filter(t => t.isCompleted).length;
    const totalCount = dayTasks.length;

    if (totalCount === 0) return <div className="h-full w-full"></div>;

    return (
      <div className="absolute bottom-1 right-1 flex items-center justify-center h-4 w-4 rounded-full text-xs font-bold
        ${completedCount === totalCount ? 'bg-accent text-accent-foreground' : 'bg-primary/50 text-primary-foreground'}
        border border-background">
        {totalCount}
      </div>
    );
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
      <GlassCard className="md:col-span-2 p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="p-3"
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
            day_today: "bg-accent/30 text-accent-foreground rounded-md",
            caption_label: "font-pixel text-lg",
            head_cell: "font-pixel text-muted-foreground",
            day: "h-12 w-12 relative text-base hover:bg-primary/10 rounded-md transition-colors",
            cell: "p-0", 
          }}
          components={{
            DayContent: DayCellContent
          }}
        />
      </GlassCard>

      <GlassCard className="md:col-span-1 p-4 space-y-3 min-h-[300px] max-h-[calc(100vh-200px)] overflow-y-auto">
        <h3 className="text-xl font-pixel text-primary mb-3">
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
        </h3>
        {selectedDate && tasksForSelectedDate.length === 0 && (
          <p className="text-muted-foreground text-sm">No quests recorded for this day.</p>
        )}
        {tasksForSelectedDate.map(event => (
          <Popover key={event.id}>
            <PopoverTrigger asChild>
              <div className="p-3 rounded-lg bg-card/50 border border-border/30 cursor-pointer hover:border-accent/70 transition-colors">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${event.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {event.title}
                  </span>
                  {event.isCompleted 
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" /> 
                    : <Circle className="h-4 w-4 text-yellow-400" />}
                </div>
                <Badge variant="outline" className="mt-1 text-xs bg-accent/10 text-accent border-accent/20">+{event.xp} XP</Badge>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-60 glassmorphic p-4 space-y-2">
              <p className="font-semibold text-primary-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">XP: {event.xp}</p>
              <p className="text-xs text-muted-foreground">Status: {event.isCompleted ? "Completed" : "Pending/Missed"}</p>
              <Button 
                size="sm" 
                className="w-full bg-primary hover:bg-primary/80"
                onClick={() => handleRevive(event.originalTaskId)}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Revive Quest
              </Button>
            </PopoverContent>
          </Popover>
        ))}
      </GlassCard>
    </div>
  );
}

    