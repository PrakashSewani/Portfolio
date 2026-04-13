import { motion, useAnimationControls, useScroll, useTransform, useMotionValue, useSpring } from 'motion/react';
import { ArrowDownRight, Download } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '../lib/utils';

export default function Hero() {
  const controls = useAnimationControls();
  const [isIdle, setIsIdle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Magnetic effect for the name
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const magneticX = useSpring(mouseX, springConfig);
  const magneticY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Limit the magnetic pull
    mouseX.set(distanceX * 0.1);
    mouseY.set(distanceY * 0.1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 10000);
    };

    window.addEventListener('scroll', handleScroll);
    timeout = setTimeout(() => setIsIdle(true), 10000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (isIdle) {
      controls.start({
        y: [0, -15, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
      controls.set({ y: 0 });
    }
  }, [isIdle, controls]);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  const name = "Prakash Sewani";
  const firstName = "Prakash";
  const lastName = "Sewani";

  const RollingChar = ({ char }: { char: string }) => {
    if (char === " ") return <span className="inline-block w-[0.2em]">&nbsp;</span>;

    return (
      <motion.div
        initial="initial"
        whileHover="hovered"
        className="relative inline-block overflow-hidden h-[1.1em] leading-[1.1em] cursor-default"
      >
        <motion.div
          variants={{
            initial: { y: 0 },
            hovered: { y: "-100%" },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-[#141414] dark:text-white">
            {char}
          </span>
        </motion.div>
        <motion.div
          className="absolute inset-0"
          variants={{
            initial: { y: "100%" },
            hovered: { y: 0 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-[#3b82f6]">
            {char}
          </span>
        </motion.div>
      </motion.div>
    );
  };

  const renderCharacters = (text: string) => {
    return text.split("").map((char, i) => (
      <RollingChar key={i} char={char} />
    ));
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-24 pb-32 md:pb-12 overflow-hidden bg-white dark:bg-[#000000] transition-colors">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
          >
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-white/40">
              Senior Software Engineer
            </span>
            <div className="hidden md:block h-[1px] w-12 bg-gray-200 dark:bg-white/10" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-400 dark:text-white/40">
              Microfrontends & Systems
            </span>
          </motion.div>

          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative"
          >
            <h2 className="text-[14vw] md:text-[18vw] font-serif tracking-tighter text-[#141414] dark:text-white opacity-5 select-none absolute -top-8 md:-top-24 left-0 pointer-events-none">
              ENGINEER
            </h2>
            <motion.div 
              style={{ x: magneticX, y: magneticY }}
              className="overflow-hidden"
            >
              <motion.h1 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-[14vw] md:text-[10vw] font-serif leading-[0.85] tracking-tighter text-[#141414] dark:text-white select-none relative z-10"
              >
                <div className="flex flex-wrap gap-x-[0.2em]">
                  <div className="flex">{renderCharacters(firstName)}</div>
                  <div className="flex">{renderCharacters(lastName)}</div>
                </div>
              </motion.h1>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col gap-6"
            >
              <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-600 dark:text-white/60 max-w-lg">
                Architecting scalable microfrontend ecosystems and high-performance systems. Transforming software experiences with precision and modern engineering.
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group p-[2px] overflow-hidden"
                >
                  {/* Border Beam Effect - Thicker and more visible */}
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0_200deg,#3b82f6_240deg,#ef4444_280deg,#eab308_320deg,#22c55e_360deg)] opacity-100"
                  />
                  
                  {/* Enhanced Glow - Larger and more intense */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/40 via-red-500/40 to-green-500/40 opacity-100 blur-3xl -z-10" />
                  
                  <a
                    href="https://prakashsewaniresume.tiiny.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-8 py-4 bg-[#141414] dark:bg-white text-white dark:text-[#0a0a0a] text-xs uppercase font-bold tracking-widest flex items-center gap-2 transition-all"
                  >
                    View Resume <Download size={16} />
                  </a>
                </motion.div>
                
                <a href="#contact" className="text-xs uppercase font-bold tracking-widest border-b-2 border-[#141414] dark:border-white pb-1 text-[#141414] dark:text-white hover:text-gray-500 dark:hover:text-white/60 transition-colors">
                  Get in touch
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col justify-end items-start md:items-end gap-2"
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 font-bold mb-4">
                Core Competencies
              </div>
              <div className="flex flex-wrap justify-start md:justify-end gap-x-4 gap-y-2 max-w-xs md:text-right">
                {['TypeScript', 'JavaScript', 'Node.js', 'Python', 'GraphQL', 'Sockets', '.NET Core', 'Single-Spa'].map((tech) => (
                  <span key={tech} className="text-sm font-mono font-medium text-[#141414] dark:text-white">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden sm:flex"
      >
        <motion.div 
          animate={controls}
          className="flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-white/40">Scroll to explore</span>
          <div className="w-[2px] h-16 bg-gradient-to-b from-gray-300 to-transparent dark:from-white/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
