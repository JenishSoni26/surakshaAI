'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownMessage({ content, isUser = false }) {
  if (isUser) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="markdown-content text-sm leading-relaxed text-on-surface">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-base font-extrabold my-2 text-on-surface border-b border-outline-variant/20 pb-1">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-sm font-bold my-2 text-on-surface">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-xs font-bold my-1.5 text-on-surface">{children}</h3>;
          },
          strong({ children }) {
            return <strong className="font-bold text-on-surface">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2 pl-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2 pl-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-sm leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/60 pl-3 py-1 my-2 bg-surface-container/50 italic text-on-surface-variant rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              return (
                <div className="my-3 rounded-xl overflow-hidden bg-[#0d1b4b] border border-outline-variant/20 shadow-md">
                  <div className="bg-[#0a0f2e] px-4 py-1.5 text-[11px] font-mono text-on-surface-variant/70 border-b border-outline-variant/10 flex justify-between items-center">
                    <span>{match[1]}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono text-blue-200 leading-relaxed">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }
            return (
              <code className="bg-surface-container-high text-primary px-1.5 py-0.5 rounded text-xs font-mono font-semibold" {...props}>
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-xl border border-outline-variant/20">
                <table className="w-full text-xs text-left border-collapse">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-surface-container font-bold text-on-surface border-b border-outline-variant/20">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-outline-variant/10">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-surface-container-high/30 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-3.5 py-2 font-bold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2 text-on-surface-variant">{children}</td>;
          },
          a({ href, children }) {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : '_self'}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                {children}
                {isExternal && <span className="material-symbols-outlined text-[12px] opacity-70">open_in_new</span>}
              </a>
            );
          },
          hr() {
            return <hr className="my-3 border-outline-variant/20" />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
