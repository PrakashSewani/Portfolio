import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';

export default function Background() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none select-none">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] contrast-150 brightness-100 mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Drifting Soft Blobs */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-50/30 dark:bg-blue-500/[0.02] blur-[120px] -z-10"
      />
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-50/30 dark:bg-indigo-500/[0.01] blur-[100px] -z-10"
      />

      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gray-100/20 dark:bg-white/[0.01] blur-[140px] -z-10"
      />

      {/* Subtle Grid with Parallax-like drift */}
      <motion.div 
        animate={{
          y: [0, -24, 0],
          translateX: mousePos.x,
          translateY: mousePos.y,
        }}
        transition={{
          y: { duration: 15, repeat: Infinity, ease: "linear" },
          translateX: { type: "spring", stiffness: 50, damping: 20 },
          translateY: { type: "spring", stiffness: 50, damping: 20 },
        }}
        className="absolute inset-[-5%] data-grid opacity-[0.05] dark:opacity-[0.03]" 
      />
    </div>
  );
}
