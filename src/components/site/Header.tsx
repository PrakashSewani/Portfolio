import { useCallback, useEffect, useState } from 'react';
import { SECTIONS, profile, type SectionId } from '../../data/profile';
import LayerMark from '../LayerMark';
import { Menu } from '../Icons';
import MobileNav from './MobileNav';

interface Props {
  /** The home-page section in view, or null off the home page. */
  active: SectionId | null;
  onHome: boolean;
}

const NAV = SECTIONS.filter((s) => s.nav);

/** The name and the sections. Nothing else competes for the bar. */
export default function Header({ active, onHome }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Stable, so the menu's focus-trap effect does not re-run on every scroll-driven render.
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  return (
    <header className={scrolled ? 'bar is-scrolled' : 'bar'}>
      <div className="bar-inner wrap">
        <a className="bar-brand" href="/" data-link aria-label={`${profile.name}, home`}>
          <LayerMark size={26} />
          <span className="bar-name">{profile.name}</span>
        </a>

        <nav className="bar-nav" aria-label="Sections">
          <ol>
            {NAV.map((section, i) => (
              <li key={section.id}>
                <a href={href(section.id)} data-link aria-current={active === section.id ? 'true' : undefined}>
                  <span className="bar-n">{String(i + 1).padStart(2, '0')}</span>
                  {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <button type="button" className="bar-menu" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(true)}>
          <Menu size={18} />
          <span>Menu</span>
        </button>
      </div>
      <MobileNav open={menuOpen} onClose={closeMenu} onHome={onHome} active={active} />
    </header>
  );
}
