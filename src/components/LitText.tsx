import type { CSSProperties } from 'react';

/**
 * Text split into one span per word, so a scroll position (`--lit`, 0 → 1, set by an ancestor) can
 * light it up in reading order. Without `--lit` every word is fully lit.
 */
export default function LitText({ text, className }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p className={className ? `lit ${className}` : 'lit'} style={{ '--n': words.length } as CSSProperties}>
      {words.map((w, k) => (
        <span key={k} className="w" style={{ '--i': k } as CSSProperties}>
          {w}{' '}
        </span>
      ))}
    </p>
  );
}
