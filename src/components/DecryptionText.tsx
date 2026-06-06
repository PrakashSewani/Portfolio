import { useEffect, useRef, useState } from 'react';

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

interface DecryptionTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  trigger?: 'mount' | 'inview';
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
  appendCursor?: boolean;
}

export default function DecryptionText({
  text,
  className = '',
  delay = 0,
  speed = 30,
  trigger = 'inview',
  as: Tag = 'span',
  appendCursor = false,
}: DecryptionTextProps) {
  const [display, setDisplay] = useState(text.split('').map(() => ' '));
  const [revealed, setRevealed] = useState(false);
  const [liveText, setLiveText] = useState('');
  const ref = useRef<HTMLElement>(null);
  const startedRef = useRef(false);

  const runDecryption = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const chars = text.split('');
    const total = chars.length;
    let resolved = 0;

    const interval = setInterval(() => {
      setDisplay(() => {
        const next = chars.map((char, i) => {
          if (char === ' ') return ' ';
          if (i < resolved) return char;
          return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        });
        return next;
      });

      if (resolved < total) {
        resolved++;
      } else {
        clearInterval(interval);
        setRevealed(true);
        setLiveText(text);
      }
    }, speed);
  };

  useEffect(() => {
    if (trigger === 'mount') {
      const timer = setTimeout(runDecryption, delay);
      return () => clearTimeout(timer);
    }

    if (trigger === 'inview' && ref.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const timer = setTimeout(runDecryption, delay);
              observer.disconnect();
              return () => clearTimeout(timer);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [trigger, delay]);

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return (
      <Tag ref={ref as any} className={className}>
        {text}
        {appendCursor && <span className="terminal-cursor" aria-hidden="true">█</span>}
      </Tag>
    );
  }

  return (
    <Tag ref={ref as any} className={className}>
      {/* Visually hidden live region for screen readers */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </span>
      {/* Animated content hidden from screen readers */}
      <span aria-hidden="true">
        {display.map((char, i) => (
          <span key={i} className="decryption-char" style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}>
            {char}
          </span>
        ))}
        {appendCursor && revealed && <span className="terminal-cursor" aria-hidden="true">█</span>}
      </span>
    </Tag>
  );
}
