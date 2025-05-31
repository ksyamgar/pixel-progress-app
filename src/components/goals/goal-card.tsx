
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
      case "work": return <Zap className="h-3.5 w-3.5 text-blue-400" />;
      case "study": return <Zap className="h-3.5 w-3.5 text-green-400" />;
      case "fitness": return <Zap className="h-3.5 w-3.5 text-orange-400" />;
      case "hobby": return <Zap className="h-3.5 w-3.5 text-purple-400" />;
      case "chore": return <Zap className="h-3.5 w-3.5 text-gray-400" />;
      default: return <Tag className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <GlassCard className="w-full font-mono">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-1.5">
        <div className="space-y-0.5">
          <CardTitle className={`text-lg flex items-center ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary'}`}>
            <Checkbox
              id={`task-main-${task.id}`}
              checked={task.isCompleted}
              onCheckedChange={() => onToggleComplete(task.id)}
              className="mr-2.5 h-4 w-4 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              disabled={task.subTasks.length > 0 && !task.subTasks.every(st => st.isCompleted)}
            />
            {task.title}
          </CardTitle>
          {task.description && <p className="text-xs text-muted-foreground pt-0.5">{task.description}</p>}
        </div>
        <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30 text-xs py-0.5 px-2">+{task.xp} XP</Badge>
      </CardHeader>
      <CardContent className="p-3 pt-1 pb-1.5">
        <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mb-2">
          {task.category && (
            <div className="flex items-center gap-1 p-1 px-1.5 rounded-sm bg-card/50 border border-border/30">
              {getCategoryIcon(task.category)} {task.category}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 p-1 px-1.5 rounded-sm bg-card/50 border border-border/30">
              <CalendarDays className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.timeAllocation && (
            <div className="flex items-center gap-1 p-1 px-1.5 rounded-sm bg-card/50 border border-border/30">
              <Clock className="h-3 w-3" /> {task.timeAllocation} min
            </div>
          )}
        </div>

        {task.subTasks.length > 0 && (
          <>
            <Progress value={progress} className="w-full h-1.5 my-1.5 bg-primary/20 [&>div]:bg-accent" />
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="subtasks" className="border-b-0">
                <AccordionTrigger className="text-xs hover:no-underline py-0.5 text-muted-foreground hover:text-accent">
                  {completedSubtasks}/{task.subTasks.length} Sub-tasks
                </AccordionTrigger>
                <AccordionContent className="pt-1.5 space-y-1.5">
                  {task.subTasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center justify-between text-sm ml-2 p-1.5 rounded bg-card/30 border border-border/20">
                      <div className="flex items-center">
                        <Checkbox
                          id={`subtask-${subtask.id}`}
                          checked={subtask.isCompleted}
                          onCheckedChange={() => onToggleComplete(task.id, subtask.id)}
                          className="mr-2 h-3.5 w-3.5 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                        />
                        <label htmlFor={`subtask-${subtask.id}`} className={`text-xs ${subtask.isCompleted ? 'line-through text-muted-foreground/70' : 'text-foreground/90'}`}>
                          {subtask.title}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20 py-0.5 px-1.5">+{subtask.xp} XP</Badge>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-1.5 p-3 pt-1">
        <Button variant="outline" size="sm" onClick={() => onAddSubtask(task.id)} className="text-xs h-7 px-2 hover:bg-primary/10 hover:text-accent">
          <PlusCircle className="h-3 w-3 mr-1" /> Sub-task
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="text-muted-foreground hover:text-accent h-7 w-7">
          <Edit3 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive h-7 w-7">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </GlassCard>
  );
}
