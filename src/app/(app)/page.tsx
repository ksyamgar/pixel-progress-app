
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/shared/glass-card";
import type { Task } from "@/lib/types";
import { PlusCircle, Zap, Target, CheckSquare, ListChecks, Edit3, Trash2, Camera, Upload, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialTasks: Task[] = [
  { id: "1", title: "Complete UI Mockups", xp: 50, isCompleted: false, subTasks: [], createdAt: "2024-07-29T10:00:00.000Z", category: "work", timeAllocation: 120 },
  { id: "2", title: "Morning Workout", xp: 30, isCompleted: true, subTasks: [], createdAt: "2024-07-29T08:00:00.000Z", category: "fitness", timeAllocation: 45 },
  { id: "3", title: "Read Chapter 5", xp: 20, isCompleted: false, subTasks: [{id: '3a', title: 'Review notes', xp: 5, isCompleted: false}], createdAt: "2024-07-29T14:00:00.000Z", category: "study", timeAllocation: 60 },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [userXP, setUserXP] = useState(1250);
  const [rivalXP, setRivalXP] = useState(1100);
  const [inspirationImageSrc, setInspirationImageSrc] = useState<string | null>(null);
  const [showInspirationCamera, setShowInspirationCamera] = useState(false);
  const [hasInspirationCameraPermission, setHasInspirationCameraPermission] = useState<boolean | null>(null);

  const inspirationVideoRef = useRef<HTMLVideoElement>(null);
  const inspirationCanvasRef = useRef<HTMLCanvasElement>(null);
  const inspirationFileRef = useRef<HTMLInputElement>(null);
  const inspirationStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Cleanup camera stream on component unmount
    return () => {
      if (inspirationStreamRef.current) {
        inspirationStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    const newTaskItem: Task = {
      id: String(Date.now()),
      title: newTaskTitle,
      xp: Math.floor(Math.random() * 30) + 10,
      isCompleted: false,
      subTasks: [],
      createdAt: new Date().toISOString(),
      category: "chore"
    };
    setTasks(prevTasks => [newTaskItem, ...prevTasks]);
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

  const handleInspirationImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setInspirationImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startInspirationCamera = async () => {
    setShowInspirationCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasInspirationCameraPermission(true);
        inspirationStreamRef.current = stream;
        if (inspirationVideoRef.current) {
          inspirationVideoRef.current.srcObject = stream;
        }
      } else {
        throw new Error("getUserMedia not supported");
      }
    } catch (error) {
      console.error('Error accessing inspiration camera:', error);
      setHasInspirationCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
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
      setInspirationImageSrc(dataUri);
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


  return (
    <div className="space-y-4">
      <GlassCard>
        <CardHeader className="py-3 px-3">
          <CardTitle className="text-lg text-primary flex items-center"><ListChecks className="mr-1.5 h-5 w-5" />Today's Quests</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex gap-1.5 mb-3">
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New quest..."
              className="font-mono bg-background/50 border-primary/50 focus:border-accent h-8 text-xs"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <Button onClick={handleAddTask} variant="default" size="sm" className="bg-primary hover:bg-primary/80 font-mono h-8 text-xs">
              <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground py-2 text-xs">No quests for today. Add some!</p>
          )}

          <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center justify-between p-2 rounded-md bg-card/70 border border-border/50 shadow-sm hover:shadow-primary/10 transition-shadow">
                <div className="flex items-center">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.isCompleted}
                    onCheckedChange={() => toggleTaskCompletion(task.id)}
                    className="mr-2 h-3.5 w-3.5 border-primary data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                  />
                  <label htmlFor={`task-${task.id}`} className={`font-mono text-xs ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary-foreground'}`}>
                    {task.title}
                  </label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-mono py-0.5 px-1 rounded-sm bg-accent/20 text-accent border border-accent/30">
                    +{task.xp} XP
                  </span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent h-6 w-6">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-6 w-6">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </GlassCard>
      
      <GlassCard className="font-pixel">
        <CardHeader className="py-3 px-3">
          <CardTitle className="text-lg text-primary flex items-center"><Target className="mr-1.5 h-5 w-5" /> Daily Mission Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 px-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <GlassCard className="p-2.5">
              <h3 className="text-base font-semibold text-accent mb-1 flex items-center"><Zap className="mr-1 h-4 w-4 text-yellow-400" />Your XP</h3>
              <p className="text-2xl font-bold text-primary-foreground">{userXP}</p>
              <Progress value={progressPercentage} className="mt-1 h-2 bg-primary/30 [&>div]:bg-accent" />
              <p className="text-xs text-muted-foreground mt-0.5">{Math.round(progressPercentage)}% of daily tasks XP earned.</p>
            </GlassCard>
            <GlassCard className="p-2.5">
               <h3 className="text-base font-semibold text-accent mb-1 flex items-center"><Zap className="mr-1 h-4 w-4 text-red-500" />AI Rival XP</h3>
               <p className="text-2xl font-bold text-primary-foreground">{rivalXP}</p>
               <Image data-ai-hint="robot enemy" src="https://source.unsplash.com/random/180x80?robot,enemy" alt="AI Rival Visual" width={180} height={80} className="mt-1 rounded-sm opacity-70 mx-auto" />
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>
      
      <GlassCard>
        <CardHeader className="py-3 px-3">
           <h3 className="font-pixel text-lg text-primary">My Game Art Inspiration</h3>
        </CardHeader>
        <CardContent className="pt-0 px-3 pb-3">
          <div className="space-y-2">
            {inspirationImageSrc ? (
              <div className="relative group">
                <img src={inspirationImageSrc} alt="Inspiration" className="w-full max-h-60 object-contain rounded-md border-2 border-accent/50" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setInspirationImageSrc(null);
                    if (inspirationFileRef.current) inspirationFileRef.current.value = ""; // Reset file input
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No inspiration image set. Upload or capture one!
              </div>
            )}

            {showInspirationCamera && (
              <div className="space-y-1.5">
                <video ref={inspirationVideoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
                {hasInspirationCameraPermission === false && (
                    <Alert variant="destructive" className="text-xs">
                        <Camera className="h-3.5 w-3.5" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>Enable camera permissions to use this feature.</AlertDescription>
                    </Alert>
                )}
                <div className="flex gap-1.5">
                  <Button onClick={captureInspirationImage} size="sm" className="flex-1 h-8 text-xs" disabled={hasInspirationCameraPermission === false}>
                    <Camera className="mr-1 h-3.5 w-3.5" /> Capture
                  </Button>
                  <Button variant="outline" onClick={stopInspirationCamera} size="sm" className="flex-1 h-8 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <canvas ref={inspirationCanvasRef} className="hidden"></canvas>

            {!showInspirationCamera && (
              <div className="flex gap-1.5">
                <Button onClick={() => inspirationFileRef.current?.click()} size="sm" variant="outline" className="flex-1 h-8 text-xs">
                  <Upload className="mr-1 h-3.5 w-3.5" /> Upload Image
                </Button>
                <Input type="file" ref={inspirationFileRef} onChange={handleInspirationImageUpload} accept="image/*" className="hidden" />
                <Button onClick={startInspirationCamera} size="sm" variant="outline" className="flex-1 h-8 text-xs">
                  <Camera className="mr-1 h-3.5 w-3.5" /> Use Camera
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
