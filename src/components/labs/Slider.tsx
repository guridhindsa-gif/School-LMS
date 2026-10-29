'use client';
export function Slider({ id, label, value, min, max, step = 1, unit = '', onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <label htmlFor={id} className="grid grid-cols-[minmax(90px,auto)_1fr_auto] items-center gap-3 text-sm">
      <span className="font-semibold">{label}</span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[rgb(var(--marigold))]" />
      <span className="min-w-[4.5rem] text-right font-mono tabular-nums">{Number.isInteger(step) ? value : value.toFixed(2)}{unit}</span>
    </label>
  );
}

export function Readout({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-surface2 px-3 py-2">
          <dt className="text-xs text-muted">{k}</dt>
          <dd className="font-mono text-base font-semibold tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
