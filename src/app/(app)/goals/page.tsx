
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalForm } from "@/components/goals/goal-form";
import type { Task, SubTask } from "@/lib/types";
import { PlusCircle, LayoutGrid, List } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const initialTasks: Task[] = [
  { id: "g1", title: "Master Tailwind CSS", description: "Complete advanced Tailwind course and build 3 projects.", xp: 200, isCompleted: false, subTasks: [{id: "g1s1", title: "Finish course videos", xp: 50, isCompleted: true}, {id: "g1s2", title: "Project 1", xp: 50, isCompleted: false}], createdAt: new Date().toISOString(), category: "study", dueDate: "2024-08-30", timeAllocation: 1200 },
  { id: "g2", title: "Daily Fitness Routine", description: "Hit the gym 5 times a week.", xp: 50, isCompleted: false, subTasks: [], createdAt: new Date().toISOString(), category: "fitness", timeAllocation: 60 },
  { id: "g3", title: "Develop Pixel Progress App", description: "Implement core features for the app.", xp: 500, isCompleted: false, subTasks: [], createdAt: new Date().toISOString(), category: "work", dueDate: "2024-09-15" },
];


export default function GoalsPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userXP, setUserXP] = useState(1250); // Placeholder

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

            setUserXP(prevXP => prevXP + taskXPChange);
            return { ...task, subTasks: updatedSubTasks, isCompleted: newOverallCompletedStatus };

          } else { // Toggling main task
            const newCompletedStatus = !task.isCompleted;
            if (newCompletedStatus && !originalTaskCompleted) taskXPChange += task.xp;
            if (!newCompletedStatus && originalTaskCompleted) taskXPChange -= task.xp;
            
            // If main task is toggled, subtasks should also reflect this if it's being marked complete
            // For simplicity, if main task is marked complete, all subtasks are considered complete.
            // If main task is marked incomplete, it doesn't affect subtask XP unless they were also toggled.
            // This logic can be refined.
            const updatedSubTasks = newCompletedStatus ? task.subTasks.map(st => ({...st, isCompleted: true})) : task.subTasks;
            if (newCompletedStatus) {
                task.subTasks.forEach(st => {
                    if(!st.isCompleted) taskXPChange += st.xp;
                });
            }

            setUserXP(prevXP => prevXP + taskXPChange);
            return { ...task, isCompleted: newCompletedStatus, subTasks: updatedSubTasks };
          }
        }
        return task;
      })
    );
  };
  
  const handleAddSubtask = (taskId: string) => {
    // This would typically open a small form or inline editing for the subtask.
    // For now, let's find the task and potentially open the main form with it.
    const taskToEdit = tasks.find(t => t.id === taskId);
    if (taskToEdit) {
      handleOpenForm(taskToEdit); // Re-open form to add subtask
    }
  };


  return (
    <div className="space-y-6 font-mono">
      <GlassCard className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-pixel text-primary">My Quests & Goals</h1>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'grid' ? "default" : "outline"} size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/20'}>
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant={viewMode === 'list' ? "default" : "outline"} size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/20'}>
              <List className="h-5 w-5" />
            </Button>
            <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/80">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Quest
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-lg">No quests defined yet. Start your adventure by adding one!</p>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
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

    