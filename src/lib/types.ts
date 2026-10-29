export type Board = 'CBSE' | 'CISCE';
export type Stream = 'PCM' | 'PCB' | 'COM' | 'HUM';
export type Verified = 'official' | 'partly_official' | 'secondary_only' | 'draft';

export interface Unit {
  id: string;
  name: string;
  marks: number | null;
  topics: string[];
  cls?: string;
  theme?: string;
}

export interface Subject {
  id: string;
  board: string;
  cls: number;
  name: string;
  book?: string;
  note?: string;
  src?: string;
  session?: string;
  verified: Verified;
  theory?: number;
  practical?: number;
  units: Unit[];
}

export interface Group { g: string; ids: string[] }

export interface Track {
  id: string;
  name: string;
  by: string;
  min: number;
  max: number;
  shares: string;
  pre: boolean;
  base: string | null;
  areas: string[] | null;
  exams: string[];
  allow: Record<string, string[]>;
}

export interface ExamUnit { id: string; name: string; topics: string[]; cls: string | null }
export interface Exam {
  id: string;
  name: string;
  by: string | null;
  year: string | null;
  source: string | null;
  verified: boolean;
  note: string | null;
  eligibility: string | null;
  pattern: [string, string][];
  marking: [number, number];
  subjects: { name: string; units: ExamUnit[] }[];
}

export interface Profile {
  name: string;
  board: Board | null;
  cls: number | null; // 13 = repeater batch
  stream: Stream | null;
  tracks: string[];
  language: 'en' | 'hi' | 'pa';
}

/** What the tutor and generators know about the current learning moment. */
export interface LearnContext {
  kind: 'board' | 'exam';
  unitId?: string; // client-side only: links the context to the learner model
  board?: string;
  cls?: number | null;
  subject?: string;
  unit?: string;
  topics?: string[];
  exam?: string;
  examId?: string;
  units?: string[];
  mastery?: number;
  weakTopics?: string[];
  language?: 'en' | 'hi' | 'pa';
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  hint: string;
  difficulty: Difficulty;
  topic: string;
  whyWrong?: string[];
}
