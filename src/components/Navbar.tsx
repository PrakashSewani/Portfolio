import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'expertise', href: '#expertise' },
  { name: 'projects', href: '#projects' },
  { name: 'journey', href: '#journey' },
  { name: 'certs', href: '#certifications' },
  { name: 'interests', href: '#interests' },
  { name: 'contact', href: '#contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-300 bg-base/90 backdrop-blur-md border-b border-border"
    >
      <div className="flex items-center justify-between px-4 md:px-6 py-4 relative z-[70]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent flex items-center justify-center text-base font-mono text-xs font-bold">
            PS
          </div>
          <span className="font-mono text-xs tracking-tighter uppercase font-bold text-ink-dim hidden sm:inline">
            prakash_sewani / 2026
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[11px] uppercase tracking-widest font-bold transition-all relative group font-mono ${
                activeSection === link.href.slice(1)
                  ? 'text-accent'
                  : 'text-ink-dim hover:text-ink'
              }`}
            >
              {link.name}
              {activeSection === link.href.slice(1) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-success animate-pulse" />
            <span className="text-[10px] font-mono uppercase text-ink-dim tracking-widest">
              ready_for_hire
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-11 h-11 flex items-center justify-center bg-surface border border-border text-ink-dim hover:text-ink transition-all duration-300 relative z-[60]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="md:hidden flex flex-col pt-8 px-8 flex-1 overflow-y-auto bg-base"
        >
          <div className="flex flex-col gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={handleLinkClick}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className={`text-4xl uppercase tracking-tighter font-mono transition-all ${
                  activeSection === link.href.slice(1)
                    ? 'text-accent'
                    : 'text-ink-subtle hover:text-ink'
                }`}
              >
                {link.name}
              </motion.a>
            ))}

            <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success animate-pulse" />
                <span className="text-xs font-mono uppercase text-ink-dim tracking-widest">
                  ready_for_hire
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-ink-subtle">
                prakash_sewani / 2026
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Scroll Progress Bar */}
      <motion.div
        className="h-[2px] bg-accent origin-left"
        style={{ scaleX }}
      />
    </motion.nav>
  );
}
