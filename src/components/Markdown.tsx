'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { memo } from 'react';
import { useT } from '@/lib/i18n';

/** Renders AI Markdown safely (no raw HTML) with maths via KaTeX. */
function MarkdownImpl({ text, className = 'prose-lms' }: { text: string; className?: string }) {
  const { t: tr } = useT();
  // Models sometimes use \( \) and \[ \] — normalise to $ / $$ for remark-math.
  const t = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, m) => `$$${m}$$`).replace(/\\\(([\s\S]*?)\\\)/g, (_, m) => `$${m}$`);
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}<span className="sr-only"> {tr('md.newTab')}</span></a> }}
      >
        {t}
      </ReactMarkdown>
    </div>
  );
}
export const Markdown = memo(MarkdownImpl);
