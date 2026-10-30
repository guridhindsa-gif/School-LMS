'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  const { t } = useT();
  return (
    <nav aria-label={t('crumbs.label')} className="flex flex-wrap items-center gap-1 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} aria-hidden />}
            {c.href ? <Link href={c.href} className="rounded hover:text-primary hover:underline">{c.label}</Link> : <span aria-current="page" className="font-semibold text-ink">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
