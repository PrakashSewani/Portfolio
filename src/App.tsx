import { useEffect, useState } from 'react';
import Archive from './components/Archive';
import Contact from './components/Contact';
import Experience from './components/Experience';
import Hero from './components/Hero';
import Palette from './components/Palette';
import SignalPath from './components/SignalPath';
import StatusBar from './components/StatusBar';
import Work from './components/Work';
import { SECTIONS, type SectionId } from './data/profile';
import ProjectCase from './pages/ProjectCase';
import { matchProjectRoute, navigate, scrollToHash, useLinkInterception, useRoute } from './lib/router';

/** The section nearest the top 40% of the viewport. Home page only. */
function useActiveSection(enabled: boolean): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.scrollY + window.innerHeight * 0.4;
      let current: SectionId = 'top';
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
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
  }, [enabled]);
  return active;
}

/** Fade sections in as they scroll into view. Without JS the CSS never hides them in the first place. */
function useReveal(route: string) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [route]);
}

export default function App() {
  const route = useRoute();
  useLinkInterception();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const slug = matchProjectRoute(route);
  const onHome = !slug;
  const active = useActiveSection(onHome);
  useReveal(route);

  // `/projects` has no page of its own: it is the archive section of the home page.
  useEffect(() => {
    if (route === '/projects') navigate('/#archive', { replace: true });
  }, [route]);

  // The browser's own fragment scroll runs before React has rendered the sections.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) scrollToHash(hash, false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <StatusBar active={active} onOpenPalette={() => setPaletteOpen(true)} />
      <main id="main">
        {slug ? (
          <ProjectCase slug={slug} />
        ) : (
          <>
            <Hero />
            <SignalPath />
            <Work />
            <Experience />
            <Archive />
            <Contact />
          </>
        )}
      </main>
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
