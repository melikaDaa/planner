export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface HabitItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface TimelineItem {
  id: string;
  time: string; // e.g., "۰۸:۰۰"
  text: string;
  completed: boolean;
}

export interface PriorityItem {
  text: string;
  completed: boolean;
}

export interface DailyPlan {
  dateKey: string; // Gregorian "YYYY-MM-DD"
  priorities: PriorityItem[]; // Exactly 3 items
  tasks: TaskItem[];
  timeline: TimelineItem[];
  habits: HabitItem[];
  mood: string; // Mood key, e.g., 'calm' | 'happy' | 'neutral' | 'tired' | 'sad'
  energy: number; // 1 to 5
  notes: string;
  planTomorrow: string; // Advanced notes or tasks for tomorrow
}

export interface HabitDefinition {
  id: string;
  name: string;
  color?: string; // Muted color accent for each habit
}

export const MOODS = [
  { key: 'happy', label: 'عالی', emoji: '😊', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'calm', label: 'آرام', emoji: '😌', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'neutral', label: 'معمولی', emoji: '😐', color: 'bg-stone-50 text-stone-700 border-stone-200' },
  { key: 'tired', label: 'خسته', emoji: '🥱', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { key: 'sad', label: 'بی‌حوصله', emoji: '😔', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];
