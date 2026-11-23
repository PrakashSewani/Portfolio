import { useEffect, useRef, useState } from 'react';
import { SECTIONS, profile, type SectionId } from '../data/profile';
import { getTheme, onThemeChange, toggleTheme, type Theme } from '../lib/theme';
import { ArrowUpRight, Close, Menu, Moon, Search, Sun } from './Icons';

const NAV = SECTIONS.filter((s) => s.id !== 'top');

function useClock(timeZone: string) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);
  return time;
}

function useTheme(): Theme {
  const [theme, setThemeState] = useState<Theme>(getTheme);
  useEffect(() => onThemeChange(setThemeState), []);
  return theme;
}

interface Props {
  active: SectionId | null;
  onOpenPalette: () => void;
}

export default function StatusBar({ active, onOpenPalette }: Props) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const time = useClock(profile.timeZone);
  const theme = useTheme();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

  // Reading progress as a CSS variable: no React render per scroll event.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--progress', max > 0 ? String(Math.min(1, window.scrollY / max)) : '0');
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="bar" ref={barRef} data-open={open}>
      <div className="bar-inner">
        <a className="brand" href="/" data-link onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            PS
          </span>
          <span className="brand-text">
            <strong>{profile.name}</strong>
            <small>{profile.role}</small>
          </span>
        </a>

        <nav className="bar-nav" aria-label="Sections" id="site-nav">
          {NAV.map((s, i) => (
            <a
              key={s.id}
              href={`/#${s.id}`}
              data-link
              aria-current={active === s.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="nav-no">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </a>
          ))}
        </nav>

        <div className="bar-tools">
          <span className="bar-clock" title={`Local time in ${profile.location}`}>
            <i className="dot" aria-hidden="true" /> IST {time || '--:--'}
          </span>
          <button type="button" className="icon-btn" onClick={() => toggleTheme()} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button type="button" className="kbd-btn" id="cmd-trigger" onClick={onOpenPalette} aria-label="Open command palette">
            <Search />
            <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd>K</kbd>
          </button>
          <a className="btn btn-sm bar-resume" href={profile.resume} target="_blank" rel="noreferrer">
            Résumé <ArrowUpRight size={14} />
          </a>
          <button
            type="button"
            className="icon-btn bar-menu"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="bar-progress" aria-hidden="true" />
    </header>
  );
}
