
import React from 'react';

export enum View {
  Grid = 'GRID',
  Journal = 'JOURNAL',
  Community = 'COMMUNITY',
}

export interface UserData {
  dob: string | null;
  lifeExpectancy: number;
}

export interface Milestone {
  id: string;
  week: number;
  label: string;
  color: string;
}

export interface JournalEntry {
  id: string;
  week: number;
  date: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export interface TalkingPoints {
  questions: string[];
  userAnswers: string[];
}

export interface GeneratedJournalEntry {
  title: string;
  content: string;
  mood: string;
  tags: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  // Fix: Import React to use React.ReactNode type.
  icon: React.ReactNode;
}