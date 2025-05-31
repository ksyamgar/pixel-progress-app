
export interface SubTask {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
}

export interface Task {
  id:string;
  title: string;
  description?: string; // Retained for GoalForm, less relevant for quick tasks
  xp: number;
  timeAllocation?: number; // in minutes, will serve as time limit for quick tasks
  dueDate?: string; // ISO string, YYYY-MM-DD, for GoalForm
  isCompleted: boolean;
  subTasks: SubTask[]; // Primarily for GoalForm tasks
  createdAt: string; // ISO string
  reminderEnabled?: boolean; // For GoalForm
  category?: string; // For icon mapping
  image?: string; // Single image for GoalForm tasks (main task image)
  
  // New fields for quick tasks & potentially detailed tasks
  notes?: string;
  images?: string[]; // Array of data URIs for multiple images per task
}

export interface AIRival {
  xp: number;
  xpGainRule: 'hourly' | 'percentageOfUserMissed' | 'dailyFlatRate';
  xpGainValue: number;
}

export interface UserProfile {
  xp: number;
  name: string;
}

// For calendar events, essentially tasks rendered on calendar
export interface CalendarTaskEvent {
  id: string; // Can be same as original task ID if it's a direct representation
  title: string;
  date: string; // YYYY-MM-DD
  xp: number;
  isCompleted: boolean;
  originalTaskId: string;
}

export const TASK_CATEGORIES = ["work", "study", "fitness", "hobby", "chore"] as const;
export type TaskCategory = typeof TASK_CATEGORIES[number];

export const XP_GAIN_RULES = [
  { id: 'hourly', name: 'Hourly Flat Rate' },
  { id: 'percentageOfUserMissed', name: 'Percentage of User\'s Missed XP' },
  { id: 'dailyFlatRate', name: 'Daily Flat Rate' },
] as const;
export type XPGainRuleId = typeof XP_GAIN_RULES[number]['id'];
