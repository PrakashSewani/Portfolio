import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

interface BootLine {
  text: string;
  delay: number;
  type?: 'normal' | 'success' | 'warning';
}

const bootLines: BootLine[] = [
  { text: 'kernel: v6.8.0-psx-portfolio-amd64', delay: 0 },
  { text: 'init: loading system modules...', delay: 150 },
  { text: 'mod: microfrontend_arch loaded', delay: 300, type: 'success' },
  { text: 'mod: dotnet_core loaded', delay: 450, type: 'success' },
  { text: 'mod: node_runtime loaded', delay: 550, type: 'success' },
  { text: 'mod: python_env loaded', delay: 650, type: 'success' },
  { text: 'mod: graph_ql loaded', delay: 750, type: 'success' },
  { text: 'net: resolving dependencies...', delay: 900 },
  { text: 'dep: react@19.0.0 resolved', delay: 1050, type: 'success' },
  { text: 'dep: motion@12.23.24 resolved', delay: 1150, type: 'success' },
  { text: 'dep: vite@6.2.0 resolved', delay: 1250, type: 'success' },
  { text: 'fs: mounting portfolio assets...', delay: 1400 },
  { text: 'ui: initializing renderer...', delay: 1600 },
  { text: 'boot: system ready', delay: 1900, type: 'success' },
  { text: 'user: prakash_sewani authenticated', delay: 2100, type: 'success' },
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const skipRef = useRef(false);

  const finish = useCallback(() => {
    if (skipRef.current) return;
    skipRef.current = true;
    timersRef.current.forEach((timer) => clearTimeout(timer));
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Check if user has seen the preloader before
    const hasSeen = localStorage.getItem('psx_preloader_seen');
    if (hasSeen) {
      finish();
      return;
    }

    const timers: NodeJS.Timeout[] = [];

    bootLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1);
      }, line.delay);
      timers.push(timer);
    });

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          const doneTimer = setTimeout(() => {
            localStorage.setItem('psx_preloader_seen', 'true');
            finish();
          }, 400);
          timers.push(doneTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    timersRef.current = timers;

    // Escape key to skip
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        localStorage.setItem('psx_preloader_seen', 'true');
        finish();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [finish]);

  const getLineColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-ink-dim';
    }
  };

  const progressBar = (pct: number) => {
    const filled = Math.floor(pct / 5);
    const empty = 20 - filled;
    return `[${'='.repeat(filled)}>${' '.repeat(empty)}] ${pct}%`;
  };

  return (
    <motion.div
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base overflow-hidden font-mono cursor-pointer"
      onClick={() => {
        localStorage.setItem('psx_preloader_seen', 'true');
        finish();
      }}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="w-full max-w-xl px-6 flex flex-col gap-1">
        {bootLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xs ${getLineColor(line.type)}`}
            aria-hidden="true"
          >
            <span className="text-accent mr-2">{'>'}</span>
            {line.text}
          </motion.div>
        ))}

        <div className="mt-4 text-xs text-ink-dim" aria-hidden="true">
          <span className="text-accent mr-2">{'>'}</span>
          {progressBar(progress)}
        </div>
      </div>

      <div className="absolute bottom-8 left-8 text-[10px] uppercase tracking-widest font-bold text-ink-subtle" aria-hidden="true">
        © 2026 PSX_SYSTEMS
      </div>

      <div className="absolute bottom-8 right-8 text-[10px] uppercase tracking-widest font-bold text-ink-subtle animate-pulse" aria-hidden="true">
        click or esc to skip
      </div>
    </motion.div>
  );
}
