'use client';
import { useEffect, useRef } from 'react';

export type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/** Sizes a canvas to its container (with devicePixelRatio) and runs `draw` every frame. */
export function useCanvas(draw: Draw, ratio = 0.56, animate = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    let w = 0, h = 0, raf = 0;
    const start = performance.now();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = () => {
      const dpr = window.devicePixelRatio || 1;
      w = c.parentElement!.clientWidth; h = Math.round(w * ratio);
      c.width = w * dpr; c.height = h * dpr; c.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(c.parentElement!);
    const loop = (now: number) => {
      drawRef.current(ctx, w, h, reduce ? 0 : (now - start) / 1000);
      if (animate) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [ratio, animate]);
  return ref;
}

export const cssVar = (name: string, a = 1) => {
  if (typeof window === 'undefined') return '#000';
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `rgb(${v.split(' ').join(',')}${a < 1 ? `,${a}` : ''})`;
};
