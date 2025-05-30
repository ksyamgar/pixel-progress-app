
"use client";

import { useState, useEffect } from 'react';
import type { Task, SubTask, TaskCategory } from "@/lib/types";
import { TASK_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle, Trash2, Save } from "lucide-react";
import { format, parseISO } from "date-fns";
import { GlassCard } from "@/components/shared/glass-card";

interface GoalFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (task: Task) => void;
  initialTask?: Task | null;
}

const emptyTask: Task = {
  id: '',
  title: '',
  description: '',
  xp: 10,
  isCompleted: false,
  subTasks: [],
  createdAt: new Date().toISOString(),
  timeAllocation: 30,
  dueDate: format(new Date(), "yyyy-MM-dd"),
  category: TASK_CATEGORIES[0],
};

export function GoalForm({ isOpen, onOpenChange, onSubmit, initialTask }: GoalFormProps) {
  const [task, setTask] = useState<Task>(initialTask || emptyTask);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskXP, setNewSubtaskXP] = useState(5);

  useEffect(() => {
    setTask(initialTask || emptyTask);
  }, [initialTask, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: name === 'xp' || name === 'timeAllocation' ? parseInt(value) || 0 : value }));
  };

  const handleSubtaskChange = (index: number, field: keyof SubTask, value: string | number | boolean) => {
    const updatedSubtasks = [...task.subTasks];
    if (field === 'xp') {
        updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: parseInt(value as string) || 0 };
    } else if (field === 'isCompleted') {
        updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value as boolean };
    }
     else {
        updatedSubtasks[index] = { ...updatedSubtasks[index], [field]: value as string };
    }
    setTask(prev => ({ ...prev, subTasks: updatedSubtasks }));
  };

  const addSubtask = () => {
    if (newSubtaskTitle.trim() === '') return;
    const newSub: SubTask = { id: String(Date.now()), title: newSubtaskTitle, xp: newSubtaskXP, isCompleted: false };
    setTask(prev => ({ ...prev, subTasks: [...prev.subTasks, newSub] }));
    setNewSubtaskTitle('');
    setNewSubtaskXP(5);
  };

  const removeSubtask = (id: string) => {
    setTask(prev => ({ ...prev, subTasks: prev.subTasks.filter(st => st.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...task, id: task.id || String(Date.now()) });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl glassmorphic font-mono">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary font-pixel">
            {initialTask ? 'Edit Quest' : 'Create New Quest'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="title" className="text-primary-foreground/80">Title</Label>
            <Input id="title" name="title" value={task.title} onChange={handleChange} required className="bg-card/50 border-primary/30 focus:border-accent" />
          </div>
          <div>
            <Label htmlFor="description" className="text-primary-foreground/80">Description (Optional)</Label>
            <Textarea id="description" name="description" value={task.description} onChange={handleChange} className="bg-card/50 border-primary/30 focus:border-accent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="xp" className="text-primary-foreground/80">XP Value</Label>
              <Input id="xp" name="xp" type="number" value={task.xp} onChange={handleChange} required className="bg-card/50 border-primary/30 focus:border-accent" />
            </div>
            <div>
              <Label htmlFor="timeAllocation" className="text-primary-foreground/80">Time Allocation (minutes)</Label>
              <Input id="timeAllocation" name="timeAllocation" type="number" value={task.timeAllocation} onChange={handleChange} className="bg-card/50 border-primary/30 focus:border-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-primary-foreground/80">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-card/50 border-primary/30 hover:bg-card/70"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {task.dueDate ? format(parseISO(task.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glassmorphic" align="start">
                  <Calendar
                    mode="single"
                    selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                    onSelect={(date) => setTask(prev => ({...prev, dueDate: date ? format(date, "yyyy-MM-dd") : prev.dueDate}))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="category" className="text-primary-foreground/80">Category</Label>
              <Select
                value={task.category}
                onValueChange={(value: TaskCategory) => setTask(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full bg-card/50 border-primary/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glassmorphic">
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="hover:bg-primary/20 focus:bg-primary/20">{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="reminderEnabled" checked={!!task.reminderEnabled} onCheckedChange={(checked) => setTask(prev => ({...prev, reminderEnabled: Boolean(checked)}))} className="border-primary data-[state=checked]:bg-accent" />
            <Label htmlFor="reminderEnabled" className="text-primary-foreground/80">Enable Reminder (Feature Coming Soon!)</Label>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">Sub-Quests</h3>
            {task.subTasks.map((st, index) => (
              <GlassCard key={st.id} className="p-3 space-y-2 bg-card/20">
                <Input
                  placeholder="Sub-quest title"
                  value={st.title}
                  onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                  className="bg-card/50 border-primary/30 focus:border-accent"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="XP"
                    value={st.xp}
                    onChange={(e) => handleSubtaskChange(index, 'xp', e.target.value)}
                    className="w-1/3 bg-card/50 border-primary/30 focus:border-accent"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(st.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
            <GlassCard className="p-3 space-y-2 bg-card/10">
              <Input
                placeholder="New sub-quest title"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="bg-card/50 border-primary/30 focus:border-accent"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="XP"
                  value={newSubtaskXP}
                  onChange={(e) => setNewSubtaskXP(parseInt(e.target.value) || 0)}
                  className="w-1/3 bg-card/50 border-primary/30 focus:border-accent"
                />
                <Button type="button" onClick={addSubtask} variant="outline" className="hover:bg-primary/10 hover:text-accent">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Sub-Quest
                </Button>
              </div>
            </GlassCard>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="hover:bg-muted/20">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/80">
              <Save className="mr-2 h-4 w-4" /> {initialTask ? 'Save Changes' : 'Create Quest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    