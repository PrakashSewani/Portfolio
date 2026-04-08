import { motion } from 'motion/react';

interface GridScanProps {
  gridColor?: string;
  scanColor?: string;
  opacity?: number;
  scanDuration?: number;
}

export default function GridScan({
  gridColor = 'rgba(255, 255, 255, 0.05)',
  scanColor = 'rgba(255, 255, 255, 0.15)',
  opacity = 0.6,
  scanDuration = 10
}: GridScanProps) {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity }}
    >
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 2px, transparent 2px),
            linear-gradient(to bottom, ${gridColor} 2px, transparent 2px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vertical Scan Line */}
      <motion.div
        className="absolute top-0 bottom-0 w-[3px] z-10"
        style={{
          background: `linear-gradient(to bottom, transparent, ${scanColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${scanColor}`,
        }}
        animate={{
          left: ['-5%', '105%'],
        }}
        transition={{
          duration: scanDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Horizontal Scan Line */}
      <motion.div
        className="absolute left-0 right-0 h-[3px] z-10"
        style={{
          background: `linear-gradient(to right, transparent, ${scanColor}, transparent)`,
          boxShadow: `0 0 20px 2px ${scanColor}`,
        }}
        animate={{
          top: ['-5%', '105%'],
        }}
        transition={{
          duration: scanDuration * 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Radial Gradient for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.3) 100%)',
        }}
      />
    </div>
  );
}
