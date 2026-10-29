import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} aria-hidden />}
          {c.href ? <Link href={c.href} className="rounded hover:text-primary hover:underline">{c.label}</Link> : <span aria-current="page" className="font-semibold text-ink">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
