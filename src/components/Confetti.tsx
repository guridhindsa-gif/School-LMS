'use client';
import { useEffect, useRef } from 'react';

/** Small canvas confetti burst. Change `fire` (e.g. a counter) to trigger. */
export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = ref.current!; const x = c.getContext('2d')!;
    const dpr = devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; x.scale(dpr, dpr);
    const colors = ['#e2900f', '#23845a', '#2c6aa8', '#c03d14', '#6b4fbf', '#f7f2d8'];
    const parts = Array.from({ length: 90 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 4,
      r: 4 + Math.random() * 5, c: colors[(Math.random() * colors.length) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4,
    }));
    let f = 0, raf = 0;
    const tick = () => {
      x.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += p.va;
        x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.globalAlpha = Math.max(0, 1 - f / 90);
        x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore();
      }
      if (++f < 95) raf = requestAnimationFrame(tick); else x.clearRect(0, 0, innerWidth, innerHeight);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden />;
}
