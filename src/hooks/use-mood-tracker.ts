import { useState, useEffect } from "react";

export type Mood = "sad" | "anxious" | "stressed" | "happy" | "neutral";

export interface MoodEntry {
  mood: Mood;
  timestamp: string;
  date: string;
}

const STORAGE_KEY = "mindsync-mood-history";

export function useMoodTracker() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moodHistory));
  }, [moodHistory]);

  const addMood = (mood: Mood) => {
    const now = new Date();
    const entry: MoodEntry = {
      mood,
      timestamp: now.toISOString(),
      date: now.toISOString().split("T")[0],
    };
    setMoodHistory((prev) => [...prev, entry]);
  };

  const getWeeklySummary = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = moodHistory.filter((e) => new Date(e.timestamp) >= weekAgo);
    
    const counts: Record<Mood, number> = { sad: 0, anxious: 0, stressed: 0, happy: 0, neutral: 0 };
    weekEntries.forEach((e) => { counts[e.mood]++; });
    return counts;
  };

  const getLast30Days = () => {
    const now = new Date();
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return moodHistory.filter((e) => new Date(e.timestamp) >= thirtyAgo);
  };

  return { moodHistory, addMood, getWeeklySummary, getLast30Days };
}
