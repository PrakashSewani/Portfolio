import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const navLinks = [
  { name: 'Expertise', href: '#expertise' },
  { name: 'Projects', href: '#projects' },
  { name: 'Journey', href: '#journey' },
  { name: 'Interests', href: '#interests' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 transition-colors"
    >
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
            className="text-[11px] uppercase tracking-widest font-bold hover:text-gray-500 dark:text-white/60 dark:hover:text-white transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase text-gray-400 dark:text-white/40">Ready for hire</span>
        </div>
      </div>
    </motion.nav>
  );
}
