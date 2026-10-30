'use client';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { Skeleton } from '../ui';
import { PACKS } from './registry';

const LOAD = { ssr: false, loading: () => <Skeleton lines={6} /> };
const CORE: Record<string, () => Promise<{ default: ComponentType }>> = {
  counting: () => import('./CountingLab'),
  fractions: () => import('./FractionsLab'),
  refraction: () => import('./RefractionLab'),
  projectile: () => import('./ProjectileLab'),
  waves: () => import('./WavesLab'),
  grapher: () => import('./GrapherLab'),
  circuit: () => import('./CircuitLab'),
};
const LOADERS: Record<string, () => Promise<{ default: ComponentType }>> = Object.assign({}, CORE, ...PACKS.map(p => p.loaders));
// One lazily-loaded component per lab, created once at module load (code is only fetched when a lab opens).
const MAP: Record<string, ComponentType> = Object.fromEntries(Object.entries(LOADERS).map(([id, load]) => [id, dynamic(load, LOAD)]));

export function LabView({ id }: { id: string }) {
  const C = MAP[id];
  return C ? <C /> : null;
}
