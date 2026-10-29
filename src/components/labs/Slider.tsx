'use client';
export function Slider({ id, label, value, min, max, step = 1, unit = '', onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  const shown = `${Number.isInteger(step) ? value : value.toFixed(2)}${unit}`;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label htmlFor={id} className="grid grid-cols-[minmax(84px,auto)_1fr_auto] items-center gap-3 text-sm">
      <span className="font-semibold">{label}</span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={shown}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[rgb(var(--primary))] [touch-action:pan-y]"
        style={{ background: `linear-gradient(to right, rgb(var(--primary)) ${pct}%, rgb(var(--surface-3)) ${pct}%)` }} />
      <output htmlFor={id} className="min-w-[4.5rem] rounded-lg bg-surface2 px-2 py-0.5 text-right font-mono tabular-nums">{shown}</output>
    </label>
  );
}

export function Readout({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-live="polite">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-ctl border border-line bg-surface2/60 px-3 py-2">
          <dt className="text-xs font-semibold text-muted">{k}</dt>
          <dd className="font-mono text-base font-semibold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Colour key for what a lab draws. */
export function Legend({ items }: { items: [string, string][] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted" aria-label="Legend">
      {items.map(([c, l]) => <li key={l} className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-full" style={{ background: c }} aria-hidden />{l}</li>)}
    </ul>
  );
}

/** Explanatory note under a lab. */
export function LabNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-ctl border-l-4 border-teal bg-teal/[.07] px-4 py-3 text-sm text-muted">{children}</p>;
}
