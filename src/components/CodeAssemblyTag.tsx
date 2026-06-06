import { useEffect, useRef, useState } from 'react';

const RANDOM_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

interface CodeAssemblyTagProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function CodeAssemblyTag({ text, className = '', delay = 0 }: CodeAssemblyTagProps) {
  const [display, setDisplay] = useState('');
  const [assembled, setAssembled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const runAssembly = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const target = text;
    let frame = 0;
    const totalFrames = 20;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const resolvedCount = Math.floor(progress * target.length);

      let current = '';
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') {
          current += ' ';
        } else if (i < resolvedCount) {
          current += target[i];
        } else {
          current += RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
        }
      }

      setDisplay(current);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplay(target);
        setAssembled(true);
      }
    }, 30);
  };

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setTimeout(runAssembly, delay);
            observer.disconnect();
            return () => clearTimeout(timer);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    return (
      <div ref={ref} className={className}>
        {text}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <span className={assembled ? '' : 'code-tag'}>
        {display || text}
      </span>
    </div>
  );
}
