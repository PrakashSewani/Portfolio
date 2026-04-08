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
    <div className={`hidden md:block ${isHovering ? 'cursor-hover' : ''}`}>
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
      />
      <motion.div
        className="cursor-outline"
        style={{ x: outlineX, y: outlineY }}
      />
    </div>
  );
}
