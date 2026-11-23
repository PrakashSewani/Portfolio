import { useEffect, useRef } from 'react';
import { SECTIONS, profile, type SectionId } from '../../data/profile';
import { ArrowUpRight, Close } from '../Icons';
import LayerMark from '../LayerMark';

interface Props {
  open: boolean;
  onClose: () => void;
  onHome: boolean;
  active: SectionId | null;
}

const NAV = SECTIONS.filter((s) => s.nav);

/** Full-screen menu below 900 px: traps focus, closes on Esc or on any link, locks page scroll. */
export default function MobileNav({ open, onClose, onHome, active }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();
    document.documentElement.classList.add('is-locked');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 900) onClose();
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('is-locked');
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <div
      id="mobile-nav"
      ref={panelRef}
      className={open ? 'mnav is-open' : 'mnav'}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!open}
    >
      <div className="mnav-top wrap">
        <span className="mnav-brand">
          <LayerMark size={26} />
          <span className="label">Menu</span>
        </span>
        <button type="button" className="mnav-close" onClick={onClose} aria-label="Close menu">
          <Close size={20} />
        </button>
      </div>
      <nav className="mnav-body wrap" aria-label="Sections">
        <ol className="mnav-list">
          {NAV.map((section, i) => (
            <li key={section.id}>
              <a href={href(section.id)} data-link onClick={onClose} aria-current={active === section.id ? 'true' : undefined}>
                <span className="mnav-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="mnav-foot">
          <a className="link" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="mnav-ext">
            <a className="link" href={profile.github} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight />
            </a>
            <a className="link" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <ArrowUpRight />
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}
