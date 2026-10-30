'use client';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useT } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useT();
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div className="grid justify-items-center gap-4">
        <span className="panel-night grid h-20 w-20 place-items-center rounded-card shadow-lift"><Compass size={34} className="text-accent" aria-hidden /></span>
        <p className="font-mono text-sm font-semibold text-primary">{t('nf.code')}</p>
        <h1 className="h-page">{t('nf.title')}</h1>
        <p className="max-w-md text-muted">{t('nf.desc')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/student" className="btn-primary">{t('nf.home')}</Link>
          <Link href="/student/syllabus" className="btn-ghost">{t('nf.syllabus')}</Link>
        </div>
      </div>
    </main>
  );
}
