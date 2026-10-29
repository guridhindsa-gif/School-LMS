'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '../ui';

const LOAD = { ssr: false, loading: () => <Skeleton lines={6} /> };
const MAP = {
  counting: dynamic(() => import('./CountingLab'), LOAD),
  fractions: dynamic(() => import('./FractionsLab'), LOAD),
  refraction: dynamic(() => import('./RefractionLab'), LOAD),
  projectile: dynamic(() => import('./ProjectileLab'), LOAD),
  waves: dynamic(() => import('./WavesLab'), LOAD),
  grapher: dynamic(() => import('./GrapherLab'), LOAD),
  circuit: dynamic(() => import('./CircuitLab'), LOAD),
} as const;

export function LabView({ id }: { id: string }) {
  const C = MAP[id as keyof typeof MAP];
  return C ? <C /> : null;
}
