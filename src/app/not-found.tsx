import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div className="grid gap-3">
        <p className="font-display text-6xl font-extrabold text-marigold">404</p>
        <h1 className="text-2xl">This page is not in the syllabus</h1>
        <p className="text-muted">The chapter or exam may have moved. Go back to your home page.</p>
        <Link href="/student" className="btn-primary justify-self-center">Go to my home</Link>
      </div>
    </main>
  );
}
