
"use client";

import type { Task, SubTask } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit3, Trash2, PlusCircle, Zap, Clock, CalendarDays, Tag } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

interface GoalCardProps {
  task: Task;
  onToggleComplete: (taskId: string, subTaskId?: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (taskId: string) => void;
}

export function GoalCard({ task, onToggleComplete, onEdit, onDelete, onAddSubtask }: GoalCardProps) {
  const completedSubtasks = task.subTasks.filter(st => st.isCompleted).length;
  const progress = task.subTasks.length > 0 ? (completedSubtasks / task.subTasks.length) * 100 : (task.isCompleted ? 100 : 0);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "work": return <Zap className="h-4 w-4 text-blue-400" />;
      case "study": return <Zap className="h-4 w-4 text-green-400" />; // Placeholder, replace with Brain or BookOpen
      case "fitness": return <Zap className="h-4 w-4 text-orange-400" />; // Placeholder, replace with Dumbbell
      case "hobby": return <Zap className="h-4 w-4 text-purple-400" />; // Placeholder, replace with Brush
      case "chore": return <Zap className="h-4 w-4 text-gray-400" />; // Placeholder, replace with Home
      default: return <Tag className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <GlassCard className="w-full font-mono">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className={`text-xl flex items-center ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary'}`}>
            <Checkbox
              id={`task-main-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mr-3 h-5 w-5 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              disabled={task.subTasks.length > 0 && !task.subTasks.every(st => st.isCompleted)}
            />
            {task.title}
          </CardTitle>
          {task.description && <p className="text-xs text-muted-foreground pt-1">{task.description}</p>}
        </div>
        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-sm py-1 px-3">+{task.xp} XP</Badge>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
          {task.category && (
            <div className="flex items-center gap-1 p-1 px-2 rounded-md bg-card/50 border border-border/30">
              {getCategoryIcon(task.category)} {task.category}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 p-1 px-2 rounded-md bg-card/50 border border-border/30">
              <CalendarDays className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.timeAllocation && (
            <div className="flex items-center gap-1 p-1 px-2 rounded-md bg-card/50 border border-border/30">
              <Clock className="h-3 w-3" /> {task.timeAllocation} min
            </div>
          )}
        </div>

        {task.subTasks.length > 0 && (
          <>
            <Progress value={progress} className="w-full h-2 my-2 bg-primary/20 [&>div]:bg-accent" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="subtasks" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline py-1 text-muted-foreground hover:text-accent">
                  {completedSubtasks}/{task.subTasks.length} Sub-tasks
                </AccordionTrigger>
                <AccordionContent className="pt-2 space-y-2">
                  {task.subTasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center justify-between text-sm ml-2 p-2 rounded bg-card/30 border border-border/20">
                      <div className="flex items-center">
                        <Checkbox
                          id={`subtask-${subtask.id}`}
                          checked={subtask.isCompleted}
                          onCheckedChange={() => onToggleComplete(task.id, subtask.id)}
                          className="mr-2 h-4 w-4 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                        />
                        <label htmlFor={`subtask-${subtask.id}`} className={`${subtask.isCompleted ? 'line-through text-muted-foreground/70' : 'text-foreground/90'}`}>
                          {subtask.title}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">+{subtask.xp} XP</Badge>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onAddSubtask(task.id)} className="text-xs hover:bg-primary/10 hover:text-accent">
          <PlusCircle className="h-3 w-3 mr-1" /> Sub-task
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-muted-foreground hover:text-accent">
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </GlassCard>
  );
}

    