
"use client";

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalForm } from "@/components/goals/goal-form";
import type { Task, SubTask } from "@/lib/types";
import { PlusCircle, LayoutGrid, List, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

const initialTasks: Task[] = [
  { id: "g1", title: "Master Tailwind CSS", description: "Complete advanced Tailwind course and build 3 projects.", xp: 200, isCompleted: false, subTasks: [{id: "g1s1", title: "Finish course videos", xp: 50, isCompleted: true}, {id: "g1s2", title: "Project 1", xp: 50, isCompleted: false}], createdAt: "2024-07-28T10:00:00.000Z", category: "study", dueDate: "2024-08-30", timeAllocation: 1200 },
  { id: "g2", title: "Daily Fitness Routine", description: "Hit the gym 5 times a week.", xp: 50, isCompleted: false, subTasks: [], createdAt: "2024-07-28T10:05:00.000Z", category: "fitness", timeAllocation: 60 },
  { id: "g3", title: "Develop Pixel Progress App", description: "Implement core features for the app.", xp: 500, isCompleted: false, subTasks: [], createdAt: "2024-07-28T10:10:00.000Z", category: "work", dueDate: "2024-09-15" },
];

const LOCALSTORAGE_GOALS_TASKS_KEY_PREFIX = 'pixelProgressGoalsTasks_';


interface GoalsPageProps {
  userXP?: number;
  setUserXP?: Dispatch<SetStateAction<number>>;
  userName?: string;
}

export default function GoalsPage({ userXP = 0, setUserXP = () => {} }: GoalsPageProps) {
  const { user } = useAuth(); // Get user for localStorage keying
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Load tasks from localStorage on mount if user exists
  useEffect(() => {
    if (user && user.uid) {
      const storedTasks = localStorage.getItem(`${LOCALSTORAGE_GOALS_TASKS_KEY_PREFIX}${user.uid}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(initialTasks); // Fallback to initial if nothing stored
      }
    } else {
        setTasks(initialTasks); // No user, use initial defaults
    }
  }, [user]);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    if (user && user.uid) {
      localStorage.setItem(`${LOCALSTORAGE_GOALS_TASKS_KEY_PREFIX}${user.uid}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);


  const handleOpenForm = (task?: Task) => {
    setEditingTask(task || null);
    setIsFormOpen(true);
  };

  const handleSubmitGoal = (taskData: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
    } else {
      setTasks(prev => [{ ...taskData, id: String(Date.now()) }, ...prev]);
    }
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleDeleteGoal = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete && setUserXP) {
        let xpChange = 0;
        if (taskToDelete.isCompleted) {
            xpChange -= taskToDelete.xp;
            taskToDelete.subTasks.forEach(st => {
                if(st.isCompleted) xpChange -= st.xp;
            });
        } else {
            taskToDelete.subTasks.forEach(st => {
                if(st.isCompleted) xpChange -= st.xp;
            });
        }
        if (xpChange !== 0) {
            setUserXP(prevXP => prevXP + xpChange);
        }
    }
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleToggleComplete = (taskId: string, subTaskId?: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          let taskXPChange = 0;
          const originalTaskCompleted = task.isCompleted;

          if (subTaskId) {
            const updatedSubTasks = task.subTasks.map(st => {
              if (st.id === subTaskId) {
                const originalSubTaskCompleted = st.isCompleted;
                const newSubTaskCompleted = !st.isCompleted;
                if (newSubTaskCompleted && !originalSubTaskCompleted) taskXPChange += st.xp;
                if (!newSubTaskCompleted && originalSubTaskCompleted) taskXPChange -= st.xp;
                return { ...st, isCompleted: newSubTaskCompleted };
              }
              return st;
            });
            const allSubtasksCompleted = updatedSubTasks.every(st => st.isCompleted);
            const newOverallCompletedStatus = task.subTasks.length > 0 ? allSubtasksCompleted : task.isCompleted;

            if(newOverallCompletedStatus && !originalTaskCompleted && task.subTasks.length > 0) taskXPChange += task.xp;
            if(!newOverallCompletedStatus && originalTaskCompleted && task.subTasks.length > 0) taskXPChange -= task.xp;
            
            if (taskXPChange !== 0 && setUserXP) {
              setUserXP(prevXP => prevXP + taskXPChange);
            }
            return { ...task, subTasks: updatedSubTasks, isCompleted: newOverallCompletedStatus };

          } else { // Toggling main task
            const newCompletedStatus = !task.isCompleted;
            if (newCompletedStatus && !originalTaskCompleted) taskXPChange += task.xp;
            if (!newCompletedStatus && originalTaskCompleted) taskXPChange -= task.xp;
            
            const updatedSubTasks = newCompletedStatus ? task.subTasks.map(st => ({...st, isCompleted: true})) : task.subTasks;
            if (newCompletedStatus) { // If marking parent as complete, ensure all subtasks also contribute their XP if not already
                task.subTasks.forEach(st => {
                    if(!st.isCompleted) taskXPChange += st.xp;
                });
            }
            
            if (taskXPChange !== 0 && setUserXP) {
                setUserXP(prevXP => prevXP + taskXPChange);
            }
            return { ...task, isCompleted: newCompletedStatus, subTasks: updatedSubTasks };
          }
        }
        return task;
      })
    );
  };
  
  const handleAddSubtask = (taskId: string) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      handleOpenForm(taskToEdit);
    }
  };

  const handleClearProgress = () => {
    setTasks([]); // Clear tasks from state, localStorage will update
    if (setUserXP) setUserXP(0); // Reset XP, AppLayout will persist this
    toast({
      title: "Progress Reset",
      description: "All your quests and XP have been cleared.",
      className: "glassmorphic font-mono border-accent text-foreground text-sm",
    });
  };


  return (
    <div className="space-y-4 font-mono">
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          <h1 className="text-2xl font-pixel text-primary">My Quests & Goals</h1>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button variant={viewMode === 'grid' ? "default" : "outline"} size="icon" onClick={() => setViewMode('grid')} className={`h-9 w-9 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/20'}`}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? "default" : "outline"} size="icon" onClick={() => setViewMode('list')} className={`h-9 w-9 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/20'}`}>
              <List className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 text-xs">
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Reset Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="font-mono glassmorphic">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-pixel text-destructive">Confirm Reset</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs">
                    Are you sure you want to reset all your progress on this page? This will delete all your quests here and set your XP contributions from these tasks to 0. This action cannot be undone for this page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearProgress}
                    className="text-xs h-8 bg-destructive hover:bg-destructive/80"
                  >
                    Yes, Reset This Page
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => handleOpenForm()} size="sm" className="bg-primary hover:bg-primary/80 h-9 text-xs">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add New Quest
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-base">No quests defined yet. Start your adventure by adding one!</p>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {tasks.map(task => (
              <GoalCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={() => handleOpenForm(task)}
                onDelete={handleDeleteGoal}
                onAddSubtask={handleAddSubtask}
              />
            ))}
          </div>
        )}
      </GlassCard>

      <GoalForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitGoal}
        initialTask={editingTask}
      />
    </div>
  );
}
