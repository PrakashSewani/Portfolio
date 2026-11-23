import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Footer from './components/site/Footer';
import Header from './components/site/Header';
import { SECTIONS, type SectionId } from './data/profile';
import { markInteractive } from './lib/boot';
import { useActiveId, useReveal } from './lib/motion';
import { matchRoute, scrollToHash, useLinkInterception, useRoute } from './lib/router';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProjectCase from './pages/ProjectCase';
import ProjectIndex from './pages/ProjectIndex';

const SECTION_IDS = SECTIONS.map((s) => s.id);

/** The palette is never needed for first paint: load it on first use, or when the browser is idle. */
const loadPalette = () => import('./components/Palette');
const Palette = lazy(loadPalette);

export default function App() {
  const path = useRoute();
  const route = matchRoute(path);
  const onHome = route.kind === 'home';
  useLinkInterception();
  useReveal(path);
  const active = useActiveId(SECTION_IDS, onHome) as SectionId | null;

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // The first effect to run marks the moment the app became interactive (the cold-start readout).
  useEffect(() => {
    markInteractive(performance.now());
    const prefetch = () => void loadPalette();
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(prefetch, { timeout: 4000 });
    else setTimeout(prefetch, 2000);
  }, []);

  useEffect(() => {
    if (paletteOpen) setPaletteUsed(true);
  }, [paletteOpen]);

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
      <Header active={active} onHome={onHome} />
      <main id="main" tabIndex={-1}>
        {route.kind === 'home' && <Home />}
        {route.kind === 'index' && <ProjectIndex />}
        {route.kind === 'case' && <ProjectCase slug={route.slug} />}
        {route.kind === 'missing' && <NotFound path={path} />}
      </main>
      <Footer />
      {(paletteOpen || paletteUsed) && (
        <Suspense fallback={null}>
          <Palette open={paletteOpen} onClose={closePalette} />
        </Suspense>
      )}
    </>
  );
}
