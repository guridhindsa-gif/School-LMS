import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div className="grid justify-items-center gap-4">
        <span className="panel-night grid h-20 w-20 place-items-center rounded-card shadow-lift"><Compass size={34} className="text-accent" /></span>
        <p className="font-mono text-sm font-semibold text-primary">Error 404</p>
        <h1 className="h-page">This page is not in the syllabus</h1>
        <p className="max-w-md text-muted">The chapter or exam may have moved, or the link is mistyped. Head back home and pick up where you left off.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/student" className="btn-primary">Go to my home</Link>
          <Link href="/student/syllabus" className="btn-ghost">Browse my syllabus</Link>
        </div>
      </div>
    </main>
  );
}
