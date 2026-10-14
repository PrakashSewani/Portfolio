import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Command, Menu, X } from 'lucide-react';
import { WORKSPACES, type WorkspaceId } from '../data/navigation';
import { profile } from '../data/portfolio';
import { isProjectsPath, useRoute } from '../lib/router';

interface NavbarProps {
  onOpenCmd: () => void;
  activeWorkspace: WorkspaceId;
  onWorkspaceChange: (id: WorkspaceId) => void;
}

export default function Navbar({ onOpenCmd, activeWorkspace, onWorkspaceChange }: NavbarProps) {
  const route = useRoute();
  const onProjects = isProjectsPath(route);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const previousOverflow = useRef('');
  const wasOpen = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (open) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      wasOpen.current = true;
      window.setTimeout(() => menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 0);
    } else {
      document.body.style.overflow = previousOverflow.current;
      if (wasOpen.current) {
        menuButtonRef.current?.focus();
        wasOpen.current = false;
      }
    }

    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  const goTo = (id: WorkspaceId) => {
    setOpen(false);
    onWorkspaceChange(id);
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>('button, a');
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <header className="site-header">
      <button className="wordmark" onClick={() => goTo('home')} aria-label="Go to home">
        <span>PS</span>
        <strong>Prakash Sewani</strong>
        <small>Senior Engineer</small>
      </button>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {WORKSPACES.slice(1).map((item) => (
          <button
            key={item.id}
            className={activeWorkspace === item.id ? 'active' : ''}
            onClick={() => goTo(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <a id="nav-index" className={onProjects ? 'active' : ''} href="/projects" data-link>
          Index
        </a>
        <button id="cmd-trigger" className="command-button" onClick={onOpenCmd} aria-label="Open command palette">
          <Command size={12} /> <span>+ K</span>
        </button>
        <a className="resume-button" href={profile.resume} target="_blank" rel="noreferrer">
          Résumé <ArrowUpRight size={15} />
        </a>
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            ref={menuRef}
            id="mobile-navigation"
            className="mobile-nav"
            initial={shouldReduceMotion ? false : { clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={shouldReduceMotion ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={handleMenuKeyDown}
          >
            {WORKSPACES.map((item, index) => (
              <button key={item.id} onClick={() => goTo(item.id)}>
                <span>0{index + 1}</span>{item.label}
              </button>
            ))}
            <a href="/projects" data-link className={onProjects ? 'active' : ''}><span>05</span>Project index</a>
            <a href={profile.resume} target="_blank" rel="noreferrer">Open résumé <ArrowUpRight /></a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
