
export interface SubTask {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
}

export interface Task {
  id:string;
  title: string;
  description?: string;
  xp: number;
  timeAllocation?: number; // in minutes
  dueDate?: string; // ISO string, YYYY-MM-DD
  isCompleted: boolean;
  subTasks: SubTask[];
  createdAt: string; // ISO string
  reminderEnabled?: boolean;
  category?: string; // For icon mapping
  image?: string; // Data URI for attached image
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
