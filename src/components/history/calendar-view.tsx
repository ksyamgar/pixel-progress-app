
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { CalendarTaskEvent, Task } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CheckCircle2, Circle, Zap, RefreshCcw } from "lucide-react";
import { format, parseISO, isSameDay, startOfMonth } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  tasks: Task[]; 
  onReviveTask: (task: Task) => void; 
}

export function CalendarView({ tasks, onReviveTask }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    if (!selectedDate) setSelectedDate(today);
    if (!currentMonth) setCurrentMonth(startOfMonth(today));
  }, [selectedDate, currentMonth]);

  const calendarEvents = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      date: task.dueDate || task.createdAt, 
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
      onReviveTask({...taskToRevive, dueDate: format(new Date(), 'yyyy-MM-dd'), isCompleted: false, id: String(Date.now()) }); 
      toast({
        title: "Quest Revived!",
        description: `"${taskToRevive.title}" has been added to today's quests.`,
        className: "glassmorphic font-mono border-accent text-foreground text-sm",
      });
    }
  };
  
  const DayCellContent = ({ date }: { date: Date }) => {
    const dateText = date.getDate();
    const dayTasks = calendarEvents.filter(event => isSameDay(parseISO(event.date), date));

    if (dayTasks.length > 0) {
      const completedCount = dayTasks.filter(t => t.isCompleted).length;
      const totalCount = dayTasks.length;
      const indicator = (
        <div className={`absolute bottom-0.5 right-0.5 flex items-center justify-center h-3.5 w-3.5 rounded-full text-xs font-bold
          ${completedCount === totalCount ? 'bg-accent text-accent-foreground' : 'bg-primary/50 text-primary-foreground'}
          border border-background text-[0.6rem] z-0`}>
          {totalCount}
        </div>
      );
      return (
        <>
          <span className="relative z-10">{dateText}</span>
          {indicator}
        </>
      );
    }
    // Render only the date number if no tasks are present for this day
    return <>{dateText}</>;
  };

  if (!currentMonth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <GlassCard className="md:col-span-2 p-0 min-h-[320px]" /> 
        <GlassCard className="md:col-span-1 p-3 space-y-2.5 min-h-[280px]" />
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
      <GlassCard className="md:col-span-2 p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="p-2 text-sm"
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
            day_today: "bg-accent/30 text-accent-foreground rounded-md",
            caption_label: "font-pixel text-base",
            head_cell: "font-pixel text-muted-foreground text-xs",
            day: "h-10 w-10 relative text-sm hover:bg-primary/10 rounded-md transition-colors",
            cell: "p-0", 
          }}
          components={{
            DayContent: DayCellContent
          }}
        />
      </GlassCard>

      <GlassCard className="md:col-span-1 p-3 space-y-2.5 min-h-[280px] max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-180px)] overflow-y-auto">
        <h3 className="text-lg font-pixel text-primary mb-2">
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
        </h3>
        {selectedDate && tasksForSelectedDate.length === 0 && (
          <p className="text-muted-foreground text-xs">No quests recorded for this day.</p>
        )}
        {tasksForSelectedDate.map(event => (
          <Popover key={event.id}>
            <PopoverTrigger asChild>
              <div className="p-2 rounded-md bg-card/50 border border-border/30 cursor-pointer hover:border-accent/70 transition-colors">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${event.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {event.title}
                  </span>
                  {event.isCompleted 
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> 
                    : <Circle className="h-3.5 w-3.5 text-yellow-400" />}
                </div>
                <Badge variant="outline" className="mt-1 text-[0.65rem] bg-accent/10 text-accent border-accent/20 py-0.5 px-1">+{event.xp} XP</Badge>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-52 glassmorphic p-3 space-y-1.5 text-xs">
              <p className="font-semibold text-primary-foreground text-sm">{event.title}</p>
              <p className="text-muted-foreground">XP: {event.xp}</p>
              <p className="text-muted-foreground">Status: {event.isCompleted ? "Completed" : "Pending/Missed"}</p>
              <Button 
                size="sm" 
                className="w-full bg-primary hover:bg-primary/80 h-8 text-xs"
                onClick={() => handleRevive(event.originalTaskId)}
              >
                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Revive Quest
              </Button>
            </PopoverContent>
          </Popover>
        ))}
      </GlassCard>
    </div>
  );
}
