
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { GlassCard } from "@/components/shared/glass-card";
import type { Task, SubTask } from "@/lib/types";
import { PlusCircle, Zap, Target, CheckSquare, ListChecks, Edit3, Trash2, GripVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

// Mock Data
const initialTasks: Task[] = [
  { id: "1", title: "Complete UI Mockups", xp: 50, isCompleted: false, subTasks: [], createdAt: new Date().toISOString(), category: "work", timeAllocation: 120 },
  { id: "2", title: "Morning Workout", xp: 30, isCompleted: true, subTasks: [], createdAt: new Date().toISOString(), category: "fitness", timeAllocation: 45 },
  { id: "3", title: "Read Chapter 5", xp: 20, isCompleted: false, subTasks: [{id: '3a', title: 'Review notes', xp: 5, isCompleted: false}], createdAt: new Date().toISOString(), category: "study", timeAllocation: 60 },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [userXP, setUserXP] = useState(1250); // From Header mock
  const [rivalXP, setRivalXP] = useState(1100); // From Header mock

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    const newTask: Task = {
      id: String(Date.now()),
      title: newTaskTitle,
      xp: Math.floor(Math.random() * 30) + 10, // Random XP between 10-39
      isCompleted: false,
      subTasks: [],
      createdAt: new Date().toISOString(),
      category: "chore"
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskTitle("");
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const wasCompleted = task.isCompleted;
          const updatedTask = { ...task, isCompleted: !task.isCompleted };
          if (updatedTask.isCompleted && !wasCompleted) {
            setUserXP(prevXP => prevXP + updatedTask.xp);
          } else if (!updatedTask.isCompleted && wasCompleted) {
            setUserXP(prevXP => prevXP - updatedTask.xp);
          }
          return updatedTask;
        }
        return task;
      })
    );
  };
  
  const totalPossibleXP = tasks.reduce((sum, task) => sum + task.xp, 0);
  const completedXP = tasks.filter(t => t.isCompleted).reduce((sum, task) => sum + task.xp, 0);
  const progressPercentage = totalPossibleXP > 0 ? (completedXP / totalPossibleXP) * 100 : 0;


  return (
    <div className="space-y-8">
      <GlassCard className="font-pixel">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center"><Target className="mr-3 h-8 w-8" /> Daily Mission Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-lg">
            Welcome back, Pixel Pioneer! Here's your progress for today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassCard className="p-4">
              <h3 className="text-xl font-semibold text-accent mb-2 flex items-center"><Zap className="mr-2 h-6 w-6 text-yellow-400" />Your XP</h3>
              <p className="text-4xl font-bold text-primary-foreground">{userXP}</p>
              <Progress value={progressPercentage} className="mt-2 h-3 bg-primary/30 [&>div]:bg-accent" />
              <p className="text-sm text-muted-foreground mt-1">{Math.round(progressPercentage)}% of daily tasks XP earned.</p>
            </GlassCard>
            <GlassCard className="p-4">
               <h3 className="text-xl font-semibold text-accent mb-2 flex items-center"><Zap className="mr-2 h-6 w-6 text-red-500" />AI Rival XP</h3>
               <p className="text-4xl font-bold text-primary-foreground">{rivalXP}</p>
               <Image data-ai-hint="robot enemy" src="https://placehold.co/200x100.png" alt="AI Rival Visual" width={200} height={100} className="mt-2 rounded-md opacity-70 mx-auto" />
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center"><ListChecks className="mr-2 h-7 w-7" />Today's Quests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter new quest title..."
              className="font-mono bg-background/50 border-primary/50 focus:border-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask} variant="default" className="bg-primary hover:bg-primary/80 font-mono">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Quest
            </Button>
          </div>

          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No quests for today. Add some to start your adventure!</p>
          )}

          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-card/70 border border-border/50 shadow-md hover:shadow-primary/20 transition-shadow">
                <div className="flex items-center">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.isCompleted}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="mr-3 h-5 w-5 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                  />
                  <label htmlFor={`task-${task.id}`} className={`font-mono text-lg ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary-foreground'}`}>
                    {task.title}
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono py-1 px-2 rounded-md bg-accent/20 text-accent border border-accent/30">
                    +{task.xp} XP
                  </span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </GlassCard>
      
      <GlassCard>
        <CardContent className="pt-6">
          <h3 className="font-pixel text-xl text-primary mb-4">Game Art Inspiration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Image data-ai-hint="pixel character" src="https://placehold.co/150x150.png" alt="Pixel Art 1" width={150} height={150} className="rounded-md border-2 border-accent/50 opacity-80 hover:opacity-100 transition-opacity" />
            <Image data-ai-hint="pixel landscape" src="https://placehold.co/150x150.png" alt="Pixel Art 2" width={150} height={150} className="rounded-md border-2 border-accent/50 opacity-80 hover:opacity-100 transition-opacity" />
            <Image data-ai-hint="8bit item" src="https://placehold.co/150x150.png" alt="Pixel Art 3" width={150} height={150} className="rounded-md border-2 border-accent/50 opacity-80 hover:opacity-100 transition-opacity" />
            <Image data-ai-hint="pixel monster" src="https://placehold.co/150x150.png" alt="Pixel Art 4" width={150} height={150} className="rounded-md border-2 border-accent/50 opacity-80 hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

    