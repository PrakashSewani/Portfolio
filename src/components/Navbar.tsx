import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const navLinks = [
  { name: 'Expertise', href: '#expertise' },
  { name: 'Projects', href: '#projects' },
  { name: 'Journey', href: '#journey' },
  { name: 'Interests', href: '#interests' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navLinks.forEach((link) => {
      const element = document.querySelector(link.href);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 transition-colors"
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] dark:bg-white flex items-center justify-center text-white dark:text-[#0a0a0a] font-mono text-xs font-bold">
            PS
          </div>
          <span className="font-mono text-xs tracking-tighter uppercase font-bold hidden sm:inline dark:text-white/80">
            Prakash Sewani / 2026
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-[11px] uppercase tracking-widest font-bold transition-all relative group",
                activeSection === link.href.slice(1) 
                  ? "text-[#141414] dark:text-white" 
                  : "text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60"
              )}
            >
              {link.name}
              {activeSection === link.href.slice(1) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#141414] dark:bg-white"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={(e) => toggleTheme(e)}
            className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 dark:text-white/40 hover:text-[#141414] dark:hover:text-white transition-all duration-300 cursor-pointer relative z-[60]"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase text-gray-400 dark:text-white/40">Ready for hire</span>
          </div>
        </div>
      </div>
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="h-[2px] bg-[#141414] dark:bg-white origin-left"
        style={{ scaleX }}
      />
    </motion.nav>
  );
}
