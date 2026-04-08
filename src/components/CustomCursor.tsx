import { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const dotX = useSpring(0, { stiffness: 500, damping: 28 });
  const dotY = useSpring(0, { stiffness: 500, damping: 28 });
  const outlineX = useSpring(0, { stiffness: 250, damping: 20 });
  const outlineY = useSpring(0, { stiffness: 250, damping: 20 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
      outlineX.set(e.clientX - 20);
      outlineY.set(e.clientY - 20);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, .group')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [dotX, dotY, outlineX, outlineY]);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
      <motion.div
        className="cursor-dot fixed top-0 left-0"
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1
        }}
      />
      <motion.div
        className="cursor-outline fixed top-0 left-0"
        style={{ x: outlineX, y: outlineY }}
        animate={{
          width: isHovering ? 80 : 32,
          height: isHovering ? 80 : 32,
          backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0)",
          mixBlendMode: isHovering ? "difference" : "normal" as any,
          x: isHovering ? outlineX.get() - 24 : outlineX.get(),
          y: isHovering ? outlineY.get() - 24 : outlineY.get(),
        }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
      />
    </div>
  );
}
