import type { ComponentType } from 'react';

export type LabSubject = 'Maths' | 'Physics' | 'Chemistry' | 'Biology' | 'EVS' | 'Geography';

export interface LabInfo {
  id: string;
  /** English fallbacks; the interface shows `lab.<id>.title|blurb|concept|try0..2` translations. */
  title: string;
  blurb: string;
  subject: LabSubject;
  classes: string;
  /** lowest and highest class the lab is designed for (13 = repeater / entrance prep) */
  min: number;
  max: number;
  /** the idea the lab makes visible */
  concept: string;
  /** short "try this" challenges shown beside the lab */
  tries: string[];
  /** chapter names this lab belongs to (used to open it inside lessons) */
  match?: RegExp;
  /** extra tag such as 'JEE/NEET' */
  tag?: string;
}

/** A pack of labs: metadata, lazy component loaders and small card art (68×64 SVG content). */
export interface LabPack {
  labs: LabInfo[];
  loaders: Record<string, () => Promise<{ default: ComponentType }>>;
  art?: Record<string, JSX.Element>;
}
