import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ThanosSnap from './ThanosSnap';

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [shouldSnap, setShouldSnap] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (count >= 100) {
      // Wait for the last letter to finish its spring animation
      const timer = setTimeout(() => {
        setShouldSnap(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000000] text-white overflow-hidden"
    >
      <ThanosSnap trigger={shouldSnap} onComplete={onComplete}>
        <div className="relative flex flex-col items-center gap-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[rgba(255,255,255,0.4)]">
              Architecting Systems
            </span>
            <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 overflow-hidden">
              {["Prakash", "Sewani"].map((word, wordIdx) => (
                <div key={wordIdx} className="flex">
                  {word.split("").map((char, charIdx) => {
                    const globalIdx = wordIdx === 0 ? charIdx : 7 + charIdx;
                    return (
                      <motion.span
                        key={charIdx}
                        initial={{ y: "100%", opacity: 0 }}
                        animate={count > (globalIdx * 5 + 10) ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          ease: [0.22, 1, 0.36, 1],
                          type: "spring",
                          stiffness: 150,
                          damping: 12
                        }}
                        className="text-4xl md:text-6xl font-serif tracking-tighter text-white inline-block"
                      >
                        {char}
                      </motion.span>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-48 h-[1px] bg-[rgba(255,255,255,0.1)] relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${count}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <span className="text-xs font-mono tabular-nums text-[rgba(255,255,255,0.6)]">
              {Math.round(count)}%
            </span>
          </div>
        </div>
      </ThanosSnap>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-12 left-12 z-10"
      >
        <span className="text-[8px] uppercase tracking-widest font-bold text-[rgba(255,255,255,0.2)]">
          © 2026 Portfolio
        </span>
      </motion.div>
    </motion.div>
  );
}
