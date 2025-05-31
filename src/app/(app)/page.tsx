
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/shared/glass-card";
import type { Task } from "@/lib/types";
import { PlusCircle, Zap, Target, ListChecks, Edit3, Trash2, Camera, Upload, XCircle, Image as ImageIcon, ChevronDown, BookOpen, Save, UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import NextImage from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

const initialTasks: Task[] = [
  { id: "qt1", title: "Review PRD for new feature", xp: 25, isCompleted: false, subTasks: [], createdAt: "2024-07-30T10:00:00.000Z", category: "work", timeAllocation: 60, notes: "Focus on AI rival customization details. Check section 3.2.1. This note is a bit longer to test the scrolling and layout of the notes area, ensuring it handles multiline content effectively.", images: ["https://source.unsplash.com/random/100x100/?document&sig=1", "https://source.unsplash.com/random/100x100/?office&sig=2"], dataAiHints: ["document", "office"] },
  { id: "qt2", title: "Quick 15-min stretch", xp: 10, isCompleted: true, subTasks: [], createdAt: "2024-07-30T08:00:00.000Z", category: "fitness", timeAllocation: 15, images: [], notes: "", dataAiHints: [] },
  { id: "qt3", title: "Brainstorm ideas for pixel art character", xp: 15, isCompleted: false, subTasks: [], createdAt: "2024-07-30T14:00:00.000Z", category: "hobby", timeAllocation: 30, images: ["https://source.unsplash.com/random/100x100/?pixelart&sig=3", "https://source.unsplash.com/random/100x100/?characterdesign&sig=4", "https://source.unsplash.com/random/100x100/?fantasy&sig=5"], notes:"Explore different color palettes. Try a cyberpunk theme.", dataAiHints: ["pixelart", "character design", "fantasy"]},
  { id: "qt4", title: "Reply to important emails", xp: 20, isCompleted: false, subTasks: [], createdAt: "2024-07-30T09:00:00.000Z", category: "work", timeAllocation: 45, images: [], notes: "Client X, Project Y follow-up.", dataAiHints: [] },
];

interface DashboardPageProps {
  userXP?: number;
  setUserXP?: Dispatch<SetStateAction<number>>;
  userName?: string; // userName is also passed from layout
}

export default function DashboardPage({ userXP = 0, setUserXP = () => {} }: DashboardPageProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  // userXP and setUserXP are now props
  const [rivalXP, setRivalXP] = useState(1100);
  
  const [inspirationImages, setInspirationImages] = useState<string[]>([
      "https://source.unsplash.com/random/150x150/?pixel,character&sig=101",
      "https://source.unsplash.com/random/150x150/?pixel,landscape&sig=102",
      "https://source.unsplash.com/random/150x150/?8bit,item&sig=103",
      "https://source.unsplash.com/random/150x150/?pixel,monster&sig=104"
    ]);
  const [inspirationDataAiHints, setInspirationDataAiHints] = useState<string[]>(["pixel character", "pixel landscape", "8bit item", "pixel monster"]);


  const [showInspirationCamera, setShowInspirationCamera] = useState(false);
  const [hasInspirationCameraPermission, setHasInspirationCameraPermission] = useState<boolean | null>(null);
  const [selectedInspirationImageForOverlay, setSelectedInspirationImageForOverlay] = useState<string | null>(null);
  const [isInspirationOverlayOpen, setIsInspirationOverlayOpen] = useState(false);

  const inspirationVideoRef = useRef<HTMLVideoElement>(null);
  const inspirationCanvasRef = useRef<HTMLCanvasElement>(null);
  const inspirationFileRef = useRef<HTMLInputElement>(null);
  const inspirationStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskFormData, setEditTaskFormData] = useState<Partial<Task>>({});
  const [showQuickTaskCamera, setShowQuickTaskCamera] = useState(false);
  const [hasQuickTaskCameraPermission, setHasQuickTaskCameraPermission] = useState<boolean | null>(null);
  const quickTaskVideoRef = useRef<HTMLVideoElement>(null);
  const quickTaskCanvasRef = useRef<HTMLCanvasElement>(null);
  const quickTaskFileRef = useRef<HTMLInputElement>(null);
  const quickTaskStreamRef = useRef<MediaStream | null>(null);

  const [editingNotesTaskId, setEditingNotesTaskId] = useState<string | null>(null);
  const [currentInlineNotes, setCurrentInlineNotes] = useState<string>("");
  const inlineTaskImageFileRef = useRef<HTMLInputElement>(null);
  const [taskIdForInlineImageUpload, setTaskIdForInlineImageUpload] = useState<string | null>(null);

  const [rivalImageSrc, setRivalImageSrc] = useState("https://source.unsplash.com/random/200x100/?robot,enemy&sig=105");
  const rivalImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (inspirationStreamRef.current) {
        inspirationStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (quickTaskStreamRef.current) {
        quickTaskStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    const newTaskItem: Task = {
      id: String(Date.now()),
      title: newTaskTitle,
      xp: Math.floor(Math.random() * 20) + 5,
      isCompleted: false,
      subTasks: [],
      createdAt: new Date().toISOString(),
      category: "chore",
      notes: "",
      images: [],
      dataAiHints: [],
      timeAllocation: 30,
    };
    setTasks(prevTasks => [newTaskItem, ...prevTasks].sort((a,b) => Number(a.isCompleted) - Number(b.isCompleted)));
    setNewTaskTitle("");
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => {
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
      });
      return newTasks.sort((a,b) => Number(a.isCompleted) - Number(b.isCompleted));
    });
  };

  const totalPossibleXP = tasks.reduce((sum, task) => sum + task.xp, 0);
  const completedXP = tasks.filter(t => t.isCompleted).reduce((sum, task) => sum + task.xp, 0);
  const progressPercentage = totalPossibleXP > 0 ? (completedXP / totalPossibleXP) * 100 : 0;

  const handleInspirationImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          setInspirationImages(prev => [...prev, reader.result as string]);
          setInspirationDataAiHints(prev => [...prev, "custom upload"]);
        };
        reader.readAsDataURL(file);
      }
      if(event.target) event.target.value = "";
    }
  };

  const startInspirationCamera = async () => {
    setShowInspirationCamera(true);
    setHasInspirationCameraPermission(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasInspirationCameraPermission(true);
        inspirationStreamRef.current = stream;
        if (inspirationVideoRef.current) inspirationVideoRef.current.srcObject = stream;
      } else { throw new Error("getUserMedia not supported"); }
    } catch (error) {
      setHasInspirationCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions.'});
      setShowInspirationCamera(false);
    }
  };

  const captureInspirationImage = () => {
    if (inspirationVideoRef.current && inspirationCanvasRef.current) {
      const video = inspirationVideoRef.current;
      const canvas = inspirationCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/png');
      setInspirationImages(prev => [...prev, dataUri]);
      setInspirationDataAiHints(prev => [...prev, "camera capture"]); 
      stopInspirationCamera();
    }
  };

  const stopInspirationCamera = () => {
    if (inspirationStreamRef.current) {
      inspirationStreamRef.current.getTracks().forEach(track => track.stop());
    }
    inspirationStreamRef.current = null;
    setShowInspirationCamera(false);
  };

  const removeInspirationImage = (index: number) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index));
    setInspirationDataAiHints(prev => prev.filter((_, i) => i !== index));
  };

  const openInspirationImageInOverlay = (imageSrc: string) => {
    setSelectedInspirationImageForOverlay(imageSrc);
    setIsInspirationOverlayOpen(true);
  };

  const closeInspirationImageOverlay = () => {
    setIsInspirationOverlayOpen(false);
    setSelectedInspirationImageForOverlay(null);
  };

  const handleOpenEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskFormData({ ...task, images: [...(task.images || [])], dataAiHints: [...(task.dataAiHints || [])] });
    setIsEditTaskDialogOpen(true);
    setShowQuickTaskCamera(false);
    setHasQuickTaskCameraPermission(null);
  };

  const handleEditTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditTaskFormData(prev => ({ ...prev, [name]: (name === 'xp' || name === 'timeAllocation') ? (parseInt(value) || 0) : value }));
  };

  const handleSaveEditedTask = () => {
    if (!editingTask || !editTaskFormData) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...editTaskFormData, images: [...(editTaskFormData.images || [])], dataAiHints: [...(editTaskFormData.dataAiHints || [])] } : t).sort((a,b) => Number(a.isCompleted) - Number(b.isCompleted)));
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
    toast({ title: "Quest Updated!", description: `"${editTaskFormData.title}" has been saved.`, className: "glassmorphic font-mono text-xs" });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast({ title: "Quest Removed", variant: "destructive", className: "glassmorphic font-mono text-xs" });
  };
  
  const handleQuickTaskImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
       for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditTaskFormData(prev => ({
              ...prev, 
              images: [...(prev?.images || []), reader.result as string],
              dataAiHints: [...(prev?.dataAiHints || []), "custom upload"]
          }));
        };
        reader.readAsDataURL(file);
      }
      if(event.target) event.target.value = "";
    }
  };

  const startQuickTaskCamera = async () => {
    setShowQuickTaskCamera(true);
    setHasQuickTaskCameraPermission(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasQuickTaskCameraPermission(true);
        quickTaskStreamRef.current = stream;
        if (quickTaskVideoRef.current) quickTaskVideoRef.current.srcObject = stream;
      } else { throw new Error("getUserMedia not supported"); }
    } catch (error) {
      setHasQuickTaskCameraPermission(false);
      toast({ variant: 'destructive', title: 'Camera Access Denied', description: 'Please enable camera permissions.'});
      setShowQuickTaskCamera(false);
    }
  };

  const captureQuickTaskImage = () => {
    if (quickTaskVideoRef.current && quickTaskCanvasRef.current) {
      const video = quickTaskVideoRef.current;
      const canvas = quickTaskCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUri = canvas.toDataURL('image/png');
      setEditTaskFormData(prev => ({
        ...prev, 
        images: [...(prev?.images || []), dataUri],
        dataAiHints: [...(prev?.dataAiHints || []), "camera capture"]
      }));
      stopQuickTaskCamera();
    }
  };

  const stopQuickTaskCamera = () => {
    if (quickTaskStreamRef.current) {
      quickTaskStreamRef.current.getTracks().forEach(track => track.stop());
    }
    quickTaskStreamRef.current = null;
    setShowQuickTaskCamera(false);
  };

  const removeQuickTaskImage = (index: number) => {
    setEditTaskFormData(prev => ({
        ...prev, 
        images: prev?.images?.filter((_, i) => i !== index) || [],
        dataAiHints: prev?.dataAiHints?.filter((_,i) => i !== index) || [],
    }));
  };

  const handleEditInlineNotes = (task: Task) => {
    setEditingNotesTaskId(task.id);
    setCurrentInlineNotes(task.notes || "");
  };

  const handleSaveInlineNotes = () => {
    if (!editingNotesTaskId) return;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingNotesTaskId ? { ...task, notes: currentInlineNotes } : task
      )
    );
    setEditingNotesTaskId(null);
    setCurrentInlineNotes("");
  };
  
  const handleCancelInlineNotesEdit = () => {
    setEditingNotesTaskId(null);
    setCurrentInlineNotes("");
  };

  const handleInlineNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentInlineNotes(e.target.value);
  };

  const handleInlineTaskImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && taskIdForInlineImageUpload) {
      const currentTaskId = taskIdForInlineImageUpload;
      const file = event.target.files[0]; 
      const reader = new FileReader();
      reader.onloadend = () => {
        setTasks(prev => prev.map(t => t.id === currentTaskId ? { 
            ...t, 
            images: [...(t.images || []), reader.result as string],
            dataAiHints: [...(t.dataAiHints || []), "custom upload"] 
        } : t));
      };
      reader.readAsDataURL(file);
      setTaskIdForInlineImageUpload(null); 
      if(event.target) event.target.value = ""; 
    }
  };

  const removeTaskImageInline = (taskId: string, imageIndex: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              images: task.images?.filter((_, idx) => idx !== imageIndex) || [],
              dataAiHints: task.dataAiHints?.filter((_, idx) => idx !== imageIndex) || [],
            }
          : task
      )
    );
  };

  const handleRivalImageClick = () => {
    rivalImageInputRef.current?.click();
  };

  const handleRivalImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setRivalImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
       <GlassCard>
        <CardHeader className="p-4 md:p-5">
          <CardTitle className="text-lg md:text-xl text-primary flex items-center"><ListChecks className="mr-2 h-5 w-5 md:h-6 md:w-6" />Today's Quests</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-5 pt-0">
          <div className="flex gap-2 mb-4 md:mb-5">
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New quick quest..."
              className="font-mono bg-background/50 border-primary/50 focus:border-accent h-9 md:h-10 text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask} variant="default" size="default" className="bg-primary hover:bg-primary/80 font-mono h-9 md:h-10 text-sm px-3 md:px-4">
              <PlusCircle className="mr-1.5 h-4 w-4 md:h-5 md:w-5" /> Add
            </Button>
          </div>

          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-5 text-sm md:text-base">No quests for today. Add some!</p>
          )}

          <Accordion type="multiple" className="w-full space-y-2.5 md:space-y-3">
            {tasks.map(task => (
              <AccordionItem value={task.id} key={task.id} className="p-1 sm:p-1.5 md:p-2 rounded-md bg-card/70 border border-border/30 shadow-sm hover:shadow-primary/5 transition-shadow data-[state=open]:border-accent/40 text-sm md:text-base">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.isCompleted}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mr-2 h-4 w-4 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                    />
                    <label htmlFor={`task-${task.id}`} className={`font-mono text-xs md:text-sm truncate min-w-0 ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary-foreground'}`}>
                      {task.title}
                    </label>
                  </div>
                  <div className="flex items-center space-x-0 sm:space-x-0.5 ml-0.5 sm:ml-1 shrink-0">
                    <span className="text-[10px] px-0.5 sm:text-xs sm:px-1 font-mono py-0.5 rounded-sm bg-accent/20 text-accent border border-accent/30">
                      +{task.xp} XP
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditTaskDialog(task)} className="text-muted-foreground hover:text-accent h-5 w-5 p-0 sm:h-6 sm:w-6 sm:p-0.5">
                      <Edit3 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-5 w-5 p-0 sm:h-6 sm:w-6 sm:p-0.5">
                          <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="font-mono glassmorphic">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-pixel text-primary">Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm md:text-base">
                            Are you sure you want to delete the quest: "{task.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-sm md:text-base h-9">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="text-sm md:text-base h-9 bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {(task.images && task.images.length > 0) || (task.notes && task.notes.trim() !== "") ? (
                      <AccordionTrigger className="p-0.5 sm:p-1 hover:bg-accent/10 rounded-sm h-5 w-5 sm:h-6 sm:w-6 data-[state=open]:text-accent [&[data-state=open]>svg]:text-accent">
                         <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200" />
                      </AccordionTrigger>
                    ) : <div className="w-5 h-5 sm:w-6 sm:h-6"/> }
                  </div>
                </div>
                <AccordionContent className="pt-2.5 mt-2.5 border-t border-border/30 space-y-2.5">
                  {((task.images && task.images.length > 0) || (task.notes && task.notes.trim() !== "") || editingNotesTaskId === task.id) && (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      
                      <div className={`flex flex-col ${task.notes && task.notes.trim() !== "" || editingNotesTaskId === task.id ? 'sm:w-2/3' : 'w-full'}`}>
                        <h4 className="text-sm md:text-base font-semibold text-accent mb-2 flex items-center"><ImageIcon className="h-4 w-4 md:h-5 md:w-5 mr-2"/>Images:</h4>
                        {task.images && task.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                            {task.images.map((src, idx) => (
                              <div key={idx} className="relative aspect-square group">
                                <img 
                                  src={src} 
                                  data-ai-hint={task.dataAiHints?.[idx] || "task image"}
                                  alt={`Task image ${idx+1}`} 
                                  className="w-full h-full object-cover rounded-md border border-accent/20 group-hover:opacity-70 transition-opacity cursor-pointer"
                                  onClick={() => openInspirationImageInOverlay(src)}
                                  />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1.5 right-1.5 h-6 w-6 p-1 opacity-50 group-hover:opacity-100 transition-opacity z-10"
                                  onClick={() => removeTaskImageInline(task.id, idx)}
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                         {(task.images?.length === 0 || !task.images) && editingNotesTaskId !== task.id && <p className="text-sm md:text-base text-muted-foreground mb-2">No images yet.</p>}
                         <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-sm md:text-base mt-auto"
                          onClick={() => {
                            setTaskIdForInlineImageUpload(task.id);
                            inlineTaskImageFileRef.current?.click();
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" /> Add Image
                        </Button>
                      </div>
                      

                      {(task.notes && task.notes.trim() !== "") || editingNotesTaskId === task.id ? (
                        <div className={`flex flex-col ${task.images && task.images.length > 0 ? 'sm:w-1/3' : 'w-full mt-2.5 sm:mt-0'} flex-grow`}>
                          <h4 className="text-sm md:text-base font-semibold text-accent mb-2 flex items-center shrink-0"><BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2"/>Notes:</h4>
                          {editingNotesTaskId === task.id ? (
                            <div className="flex flex-col space-y-2 flex-grow">
                              <Textarea
                                value={currentInlineNotes}
                                onChange={handleInlineNotesChange}
                                className="text-sm md:text-base bg-background/70 border-primary/30 flex-grow min-h-[120px]"
                              />
                              <div className="flex gap-2 shrink-0 mt-auto">
                                <Button onClick={handleSaveInlineNotes} size="sm" className="h-8 text-sm md:text-base flex-1 bg-primary hover:bg-primary/80">
                                  <Save className="h-3.5 w-3.5 mr-1.5"/>Save
                                </Button>
                                <Button variant="outline" onClick={handleCancelInlineNotesEdit} size="sm" className="h-8 text-sm md:text-base flex-1">Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col flex-grow">
                              <ScrollArea className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap bg-black/10 p-2 rounded-md border border-border/20 flex-grow min-h-[100px]">
                                {task.notes}
                              </ScrollArea>
                              <Button variant="outline" size="sm" onClick={() => handleEditInlineNotes(task)} className="w-full h-8 text-sm md:text-base mt-auto shrink-0">
                                <Edit3 className="h-3.5 w-3.5 mr-1.5"/> Edit Notes
                              </Button>
                            </div>
                          )}
                        </div>
                       ) : (task.images && task.images.length > 0) ? ( 
                         <div className="flex flex-col sm:w-1/3 flex-grow">
                            <h4 className="text-sm md:text-base font-semibold text-accent mb-2 flex items-center shrink-0"><BookOpen className="h-4 w-4 mr-1.5"/>Notes:</h4>
                             <p className="text-sm md:text-base text-muted-foreground mb-2 flex-grow">No notes yet.</p>
                            <Button variant="outline" size="sm" onClick={() => handleEditInlineNotes(task)} className="w-full h-8 text-sm md:text-base mt-auto shrink-0">
                                <Edit3 className="h-3.5 w-3.5 mr-1.5"/> Add Notes
                            </Button>
                         </div>
                       ) : null 
                      }
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Input 
            type="file" 
            ref={inlineTaskImageFileRef} 
            onChange={handleInlineTaskImageUpload} 
            accept="image/*" 
            className="hidden" 
            multiple={false}
          />
        </CardContent>
      </GlassCard>
      
      <GlassCard className="font-pixel">
        <CardHeader className="p-4 md:p-5">
          <CardTitle className="text-lg md:text-xl text-primary flex items-center"><Target className="mr-2.5 h-5 w-5 md:h-6 md:w-6" /> Daily Mission Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-5 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard className="p-3 md:p-4">
              <h3 className="text-lg font-semibold text-accent mb-2 flex items-center"><Zap className="mr-2 h-5 w-5 text-yellow-400" />Your XP</h3>
              <p className="text-xl font-bold text-primary-foreground">{userXP}</p>
              <Progress value={progressPercentage} className="mt-2 h-2 bg-primary/30 [&>div]:bg-accent" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progressPercentage)}% of daily tasks XP earned.</p>
            </GlassCard>
            <GlassCard className="p-3 md:p-4">
               <h3 className="text-lg font-semibold text-accent mb-2 flex items-center"><Zap className="mr-2 h-5 w-5 text-red-500" />AI Rival XP</h3>
               <p className="text-xl font-bold text-primary-foreground">{rivalXP}</p>
                <div className="relative group cursor-pointer mt-2" onClick={handleRivalImageClick}>
                  <NextImage 
                    src={rivalImageSrc} 
                    data-ai-hint="robot enemy" 
                    alt="AI Rival Visual" 
                    width={200} 
                    height={100} 
                    className="rounded-sm opacity-70 mx-auto max-h-[50px] object-cover group-hover:opacity-50 transition-opacity" 
                  />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity max-h-[50px] mt-0">
                     <UploadCloud className="h-5 w-5 text-white/70" />
                   </div>
                </div>
                <input 
                  type="file" 
                  ref={rivalImageInputRef} 
                  onChange={handleRivalImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>
      
      <GlassCard>
        <CardHeader className="p-4 md:p-5">
           <h3 className="font-pixel text-lg md:text-xl text-primary flex items-center"><ImageIcon className="mr-2.5 h-5 w-5 md:h-6 md:w-6" />My Game Art Inspirations</h3>
        </CardHeader>
        <CardContent className="p-4 md:p-5 pt-0">
          <div className="space-y-4">
            {inspirationImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mt-2.5">
                {inspirationImages.map((src, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={src} 
                      alt={`Inspiration ${index + 1}`} 
                      data-ai-hint={inspirationDataAiHints[index] || "inspiration"}
                      className="w-full h-full object-cover rounded-md cursor-pointer border border-accent/30 hover:opacity-80 transition-opacity"
                      onClick={() => openInspirationImageInOverlay(src)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 p-1 opacity-50 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => removeInspirationImage(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {(inspirationImages.length === 0 && !showInspirationCamera) && (
              <div className="text-center py-4 text-muted-foreground text-sm md:text-base">
                No inspiration images. Upload or capture some!
              </div>
            )}

            {showInspirationCamera && (
              <div className="space-y-2.5">
                <video ref={inspirationVideoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                {hasInspirationCameraPermission === false && (
                    <Alert variant="destructive" className="text-sm py-2 px-2.5">
                        <Camera className="h-4 w-4" />
                        <AlertTitle className="text-sm font-semibold">Camera Access Denied</AlertTitle>
                        <AlertDescription className="text-sm">Enable camera permissions.</AlertDescription>
                    </Alert>
                )}
                 {hasInspirationCameraPermission === null && <p className="text-sm md:text-base text-muted-foreground text-center">Requesting camera...</p>}
                <div className="flex gap-2.5">
                  <Button onClick={captureInspirationImage} size="default" className="flex-1 h-9 text-sm md:text-base" disabled={hasInspirationCameraPermission !== true}>
                    <Camera className="mr-2 h-4 w-4" /> Capture
                  </Button>
                  <Button variant="outline" onClick={stopInspirationCamera} size="default" className="flex-1 h-9 text-sm md:text-base">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <canvas ref={inspirationCanvasRef} className="hidden"></canvas>

            {!showInspirationCamera && (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button onClick={() => inspirationFileRef.current?.click()} size="default" variant="outline" className="flex-1 h-9 text-sm md:text-base">
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                <Input type="file" ref={inspirationFileRef} onChange={handleInspirationImageUpload} accept="image/*" className="hidden" multiple />
                <Button onClick={startInspirationCamera} size="default" variant="outline" className="flex-1 h-9 text-sm md:text-base">
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>

      {editingTask && editTaskFormData && (
        <Dialog open={isEditTaskDialogOpen} onOpenChange={(isOpen) => {
            setIsEditTaskDialogOpen(isOpen);
            if (!isOpen) {
                setEditingTask(null);
                stopQuickTaskCamera();
            }
        }}>
          <DialogContent className="font-mono glassmorphic sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-pixel text-primary text-lg">Edit Quick Quest</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1 pr-2">
            <div className="space-y-2 text-sm">
              <div>
                <Label htmlFor="edit-task-title">Title</Label>
                <Input id="edit-task-title" name="title" value={editTaskFormData.title || ''} onChange={handleEditTaskFormChange} className="h-8 text-sm bg-card/50 border-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <Label htmlFor="edit-task-xp">XP</Label>
                  <Input id="edit-task-xp" name="xp" type="number" value={editTaskFormData.xp || 0} onChange={handleEditTaskFormChange} className="h-8 text-sm bg-card/50 border-primary/30" />
                </div>
                <div>
                  <Label htmlFor="edit-task-time">Time (min)</Label>
                  <Input id="edit-task-time" name="timeAllocation" type="number" value={editTaskFormData.timeAllocation || 0} onChange={handleEditTaskFormChange} className="h-8 text-sm bg-card/50 border-primary/30" />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-task-notes">Notes</Label>
                <Textarea id="edit-task-notes" name="notes" value={editTaskFormData.notes || ''} onChange={handleEditTaskFormChange} className="text-sm bg-card/50 border-primary/30 min-h-[70px]" rows={2}/>
              </div>
              <div className="space-y-1">
                <Label className="flex items-center"><ImageIcon className="h-3.5 w-3.5 mr-1.5"/>Images ({editTaskFormData.images?.length || 0})</Label>
                {editTaskFormData.images && editTaskFormData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-1 p-1 bg-black/10 rounded border border-border/20 max-h-28 overflow-y-auto">
                    {editTaskFormData.images.map((src, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img src={src} alt={`Task image ${index + 1}`} className="w-full h-full object-cover rounded-sm"/>
                        <Button variant="destructive" size="icon" className="absolute top-0.5 right-0.5 h-4 w-4 p-0.5 opacity-60 group-hover:opacity-100" onClick={() => removeQuickTaskImage(index)}>
                          <XCircle className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                 {showQuickTaskCamera && (
                  <div className="space-y-1">
                    <video ref={quickTaskVideoRef} className="w-full aspect-video rounded-sm bg-black" autoPlay muted playsInline />
                     {hasQuickTaskCameraPermission === false && (
                        <Alert variant="destructive" className="text-xs py-1 px-1.5">
                            <Camera className="h-3 w-3" /> <AlertTitle className="text-xs font-semibold">Camera Denied</AlertTitle>
                        </Alert>
                    )}
                    {hasQuickTaskCameraPermission === null && <p className="text-xs text-muted-foreground text-center">Requesting camera...</p>}
                    <div className="flex gap-1.5">
                      <Button type="button" onClick={captureQuickTaskImage} size="sm" className="flex-1 h-7 text-xs" disabled={hasQuickTaskCameraPermission !== true}>
                        <Camera className="mr-1 h-3 w-3" /> Capture
                      </Button>
                      <Button type="button" variant="outline" onClick={stopQuickTaskCamera} size="sm" className="flex-1 h-7 text-xs">Cancel</Button>
                    </div>
                  </div>
                )}
                <canvas ref={quickTaskCanvasRef} className="hidden"></canvas>
                {!showQuickTaskCamera && (
                  <div className="flex gap-1.5">
                    <Button type="button" onClick={() => quickTaskFileRef.current?.click()} size="sm" variant="outline" className="flex-1 h-7 text-xs">
                      <Upload className="mr-1 h-3 w-3" /> Upload
                    </Button>
                    <Input type="file" ref={quickTaskFileRef} onChange={handleQuickTaskImageUpload} accept="image/*" className="hidden" multiple/>
                    <Button type="button" onClick={startQuickTaskCamera} size="sm" variant="outline" className="flex-1 h-7 text-xs">
                      <Camera className="mr-1 h-3 w-3" /> Camera
                    </Button>
                  </div>
                )}
              </div>
            </div>
            </ScrollArea>
            <DialogFooter className="pt-1.5">
              <DialogClose asChild>
                <Button type="button" size="sm" variant="outline" className="h-8 text-sm">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveEditedTask} size="sm" className="bg-primary hover:bg-primary/80 h-8 text-sm">Save Quest</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isInspirationOverlayOpen && selectedInspirationImageForOverlay && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-1 sm:p-1.5"
          onClick={closeInspirationImageOverlay} 
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedInspirationImageForOverlay} 
              alt="Inspiration Overlay" 
              className="block max-w-full max-h-[98vh] object-contain rounded-md shadow-xl"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 text-white hover:bg-black/30 hover:text-primary-foreground h-7 w-7 z-10"
              onClick={closeInspirationImageOverlay}
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
