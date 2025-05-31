
"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, PlusCircle, Trash2, Save, Upload, Camera, XCircle, Image as ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { GlassCard } from "@/components/shared/glass-card";
import { useToast } from "@/hooks/use-toast";

interface GoalFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (task: Task) => void;
  initialTask?: Task | null;
}

const EMPTY_TASK_STATIC_DEFAULTS: Omit<Task, 'id' | 'createdAt' | 'dueDate'> = {
  title: '',
  description: '',
  xp: 10,
  isCompleted: false,
  subTasks: [],
  timeAllocation: 30,
  category: TASK_CATEGORIES[0],
  reminderEnabled: false,
  image: undefined,
};

export function GoalForm({ isOpen, onOpenChange, onSubmit, initialTask }: GoalFormProps) {
  const [task, setTask] = useState<Task>(() => {
    const baseTask = initialTask || {
        ...EMPTY_TASK_STATIC_DEFAULTS,
        id: '', // Will be set on submit or effect
        createdAt: new Date().toISOString(), // Placeholder, will be updated
        dueDate: undefined, // Placeholder
    };
    // Ensure dueDate is in "yyyy-MM-dd" or undefined for the Popover/Calendar
    if (baseTask.dueDate && baseTask.dueDate !== "1970-01-01") {
        try {
            baseTask.dueDate = format(parseISO(baseTask.dueDate), "yyyy-MM-dd");
        } catch (e) {
            baseTask.dueDate = undefined; // Reset if invalid
        }
    } else {
      baseTask.dueDate = undefined;
    }
    return baseTask;
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskXP, setNewSubtaskXP] = useState(5);
  const [showTaskCamera, setShowTaskCamera] = useState(false);
  const [hasTaskCameraPermission, setHasTaskCameraPermission] = useState<boolean | null>(null);

  const taskVideoRef = useRef<HTMLVideoElement>(null);
  const taskCanvasRef = useRef<HTMLCanvasElement>(null);
  const taskFileRef = useRef<HTMLInputElement>(null);
  const taskStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        let effectiveInitialTask = { ...initialTask };
        if (effectiveInitialTask.dueDate) {
             try {
                effectiveInitialTask.dueDate = format(parseISO(effectiveInitialTask.dueDate), "yyyy-MM-dd");
            } catch (e) {
                effectiveInitialTask.dueDate = undefined;
            }
        } else {
            effectiveInitialTask.dueDate = undefined;
        }
        setTask(effectiveInitialTask);

      } else {
        setTask({
          ...EMPTY_TASK_STATIC_DEFAULTS,
          id: '',
          createdAt: new Date().toISOString(),
          dueDate: format(new Date(), "yyyy-MM-dd"),
        });
      }
      setShowTaskCamera(false); // Reset camera state on open
      setHasTaskCameraPermission(null);
    } else {
        // Cleanup camera stream when dialog closes
        stopTaskCamera(false); // Don't show toast on auto-close
    }
  }, [initialTask, isOpen]);

   useEffect(() => {
    // Cleanup camera stream on component unmount
    return () => {
      stopTaskCamera(false);
    };
  }, []);


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

  const handleTaskImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setTask(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startTaskCamera = async () => {
    setShowTaskCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasTaskCameraPermission(true);
        taskStreamRef.current = stream;
        if (taskVideoRef.current) {
          taskVideoRef.current.srcObject = stream;
        }
      } else {
        throw new Error("getUserMedia not supported");
      }
    } catch (error) {
      console.error('Error accessing task camera:', error);
      setHasTaskCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use this feature.',
      });
      setShowTaskCamera(false);
    }
  };

  const captureTaskImage = () => {
    if (taskVideoRef.current && taskCanvasRef.current) {
      const video = taskVideoRef.current;
      const canvas = taskCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/png');
      setTask(prev => ({ ...prev, image: dataUri }));
      stopTaskCamera();
    }
  };

  const stopTaskCamera = (showToastOnFail = true) => {
    if (taskStreamRef.current) {
      taskStreamRef.current.getTracks().forEach(track => track.stop());
    }
    taskStreamRef.current = null;
    setShowTaskCamera(false);
    // Do not reset hasTaskCameraPermission here, so user knows if it was denied previously
  };

  const removeTaskImage = () => {
    setTask(prev => ({...prev, image: undefined}));
    if (taskFileRef.current) taskFileRef.current.value = "";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...task, id: task.id || String(Date.now()) });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glassmorphic font-mono">
        <DialogHeader>
          <DialogTitle className="text-lg text-primary font-pixel">
            {initialTask ? 'Edit Quest' : 'Create New Quest'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1 text-xs">
          <div>
            <Label htmlFor="title" className="text-primary-foreground/80 text-xs">Title</Label>
            <Input id="title" name="title" value={task.title} onChange={handleChange} required className="bg-card/50 border-primary/30 focus:border-accent h-8 text-xs" />
          </div>
          <div>
            <Label htmlFor="description" className="text-primary-foreground/80 text-xs">Description (Optional)</Label>
            <Textarea id="description" name="description" value={task.description || ''} onChange={handleChange} className="bg-card/50 border-primary/30 focus:border-accent text-xs" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="xp" className="text-primary-foreground/80 text-xs">XP Value</Label>
              <Input id="xp" name="xp" type="number" value={task.xp} onChange={handleChange} required className="bg-card/50 border-primary/30 focus:border-accent h-8 text-xs" />
            </div>
            <div>
              <Label htmlFor="timeAllocation" className="text-primary-foreground/80 text-xs">Time Allocation (min)</Label>
              <Input id="timeAllocation" name="timeAllocation" type="number" value={task.timeAllocation || ''} onChange={handleChange} className="bg-card/50 border-primary/30 focus:border-accent h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dueDate" className="text-primary-foreground/80 text-xs">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-card/50 border-primary/30 hover:bg-card/70 h-8 text-xs px-2"
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {task.dueDate ? format(parseISO(task.dueDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glassmorphic" align="start">
                  <Calendar
                    mode="single"
                    selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                    onSelect={(date) => setTask(prev => ({...prev, dueDate: date ? format(date, "yyyy-MM-dd") : undefined}))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="category" className="text-primary-foreground/80 text-xs">Category</Label>
              <Select
                value={task.category}
                onValueChange={(value: TaskCategory) => setTask(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full bg-card/50 border-primary/30 h-8 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glassmorphic">
                  {TASK_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="hover:bg-primary/20 focus:bg-primary/20 text-xs">{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 pt-0.5">
            <Checkbox id="reminderEnabled" checked={!!task.reminderEnabled} onCheckedChange={(checked) => setTask(prev => ({...prev, reminderEnabled: Boolean(checked)}))} className="border-primary data-[state=checked]:bg-accent h-3.5 w-3.5" />
            <Label htmlFor="reminderEnabled" className="text-primary-foreground/80 text-xs">Enable Reminder (Soon!)</Label>
          </div>

          {/* Task Image Section */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-primary-foreground/80 text-xs flex items-center"><ImageIcon className="w-3.5 h-3.5 mr-1"/>Task Image (Optional)</Label>
            {task.image && (
                <div className="relative group w-full aspect-video rounded-md border-2 border-accent/30 overflow-hidden">
                    <img src={task.image} alt="Task attachment" className="w-full h-full object-contain" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity"
                        onClick={removeTaskImage}
                    >
                        <XCircle className="h-3 w-3" />
                    </Button>
                </div>
            )}
            {showTaskCamera && (
              <div className="space-y-1">
                <video ref={taskVideoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                {hasTaskCameraPermission === false && (
                    <Alert variant="destructive" className="text-xs py-1.5 px-2">
                        <Camera className="h-3 w-3" />
                        <AlertTitle className="text-xs">Camera Access Denied</AlertTitle>
                    </Alert>
                )}
                <div className="flex gap-1.5">
                  <Button type="button" onClick={captureTaskImage} size="sm" className="flex-1 h-7 text-xs" disabled={hasTaskCameraPermission === false}>
                    <Camera className="mr-1 h-3 w-3" /> Capture
                  </Button>
                  <Button type="button" variant="outline" onClick={() => stopTaskCamera()} size="sm" className="flex-1 h-7 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <canvas ref={taskCanvasRef} className="hidden"></canvas>
            {!showTaskCamera && (
              <div className="flex gap-1.5">
                <Button type="button" onClick={() => taskFileRef.current?.click()} size="sm" variant="outline" className="flex-1 h-7 text-xs">
                  <Upload className="mr-1 h-3 w-3" /> Upload
                </Button>
                <Input type="file" ref={taskFileRef} onChange={handleTaskImageUpload} accept="image/*" className="hidden" />
                <Button type="button" onClick={startTaskCamera} size="sm" variant="outline" className="flex-1 h-7 text-xs">
                  <Camera className="mr-1 h-3 w-3" /> Camera
                </Button>
              </div>
            )}
          </div>


          <div className="space-y-2 pt-1">
            <h3 className="text-sm font-semibold text-primary">Sub-Quests</h3>
            {task.subTasks.map((st, index) => (
              <GlassCard key={st.id} className="p-2 space-y-1 bg-card/20">
                <Input
                  placeholder="Sub-quest title"
                  value={st.title}
                  onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                  className="bg-card/50 border-primary/30 focus:border-accent h-7 text-xs"
                />
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    placeholder="XP"
                    value={st.xp}
                    onChange={(e) => handleSubtaskChange(index, 'xp', e.target.value)}
                    className="w-1/3 bg-card/50 border-primary/30 focus:border-accent h-7 text-xs"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSubtask(st.id)} className="text-muted-foreground hover:text-destructive h-6 w-6">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </GlassCard>
            ))}
            <GlassCard className="p-2 space-y-1 bg-card/10">
              <Input
                placeholder="New sub-quest title"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="bg-card/50 border-primary/30 focus:border-accent h-7 text-xs"
              />
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  placeholder="XP"
                  value={newSubtaskXP}
                  onChange={(e) => setNewSubtaskXP(parseInt(e.target.value) || 0)}
                  className="w-1/3 bg-card/50 border-primary/30 focus:border-accent h-7 text-xs"
                />
                <Button type="button" onClick={addSubtask} size="sm" variant="outline" className="hover:bg-primary/10 hover:text-accent text-xs h-7">
                  <PlusCircle className="mr-1 h-3 w-3" /> Add Sub-Quest
                </Button>
              </div>
            </GlassCard>
          </div>

          <DialogFooter className="pt-1.5">
            <DialogClose asChild>
              <Button type="button" size="sm" variant="outline" className="hover:bg-muted/20 h-8 text-xs">Cancel</Button>
            </DialogClose>
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/80 h-8 text-xs">
              <Save className="mr-1 h-3 w-3" /> {initialTask ? 'Save Changes' : 'Create Quest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
