import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import Navbar from './components/Navbar';
import HeroDashboard from './components/HeroDashboard';
import Expertise from './components/Expertise';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Interests from './components/Interests';
import Contact from './components/Contact';
import CommandPalette from './components/CommandPalette';
import ProjectsIndex from './pages/Projects';
import ProjectCase from './pages/ProjectCase';
import { WORKSPACES, type WorkspaceId } from './data/navigation';
import { loadProjects, type LedgerRow } from './lib/projects';
import { matchProjectRoute, navigate, useLinkInterception, useRoute } from './lib/router';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const route = useRoute();
  useLinkInterception();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('home');
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const activeWorkspaceRef = useRef<WorkspaceId>(activeWorkspace);
  const pendingSection = useRef<WorkspaceId | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  const caseSlug = matchProjectRoute(route);
  const isIndex = route === '/projects';
  // Anything that is not a project route is the home page — the host's SPA fallback serves this
  // document for unknown paths, so falling back to home preserves today's behaviour.
  const page = caseSlug ? 'case' : isIndex ? 'index' : 'home';
  const onHome = page === 'home';

  useEffect(() => {
    activeWorkspaceRef.current = activeWorkspace;
  }, [activeWorkspace]);

  const handleCmdClose = () => {
    setCmdOpen(false);
    window.setTimeout(() => document.getElementById('cmd-trigger')?.focus(), 0);
  };

  useEffect(() => {
    const handler = () => setCmdOpen((prev) => !prev);
    window.addEventListener('toggle-cmd-palette', handler);
    return () => window.removeEventListener('toggle-cmd-palette', handler);
  }, []);

  // The ledger feeds the Cmd+K palette; the /projects page uses the same cached loader, so the
  // palette and the table can never disagree about what exists.
  useEffect(() => {
    let alive = true;
    loadProjects()
      .then((result) => {
        if (alive) setLedger(result.rows);
      })
      .catch(() => {
        /* the palette degrades to static destinations; the page surfaces the error */
      });
    return () => {
      alive = false;
    };
  }, []);

  // Scroll spy is only meaningful on the home page.
  useEffect(() => {
    if (!onHome) return;
    const ids = WORKSPACES.map((workspace) => workspace.id);
    const updateActive = () => {
      const trigger = window.scrollY + window.innerHeight * 0.4;
      let nextId: WorkspaceId = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top + window.scrollY <= trigger) nextId = id;
        else break;
      }
      if (nextId !== activeWorkspaceRef.current) {
        setActiveWorkspace(nextId);
        activeWorkspaceRef.current = nextId;
      }
    };
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [onHome]);

  // A section requested from another route: scroll once the home page has mounted.
  useEffect(() => {
    if (!onHome || !pendingSection.current) return;
    const id = pendingSection.current;
    pendingSection.current = null;
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [onHome, route]);

  const navigateWorkspace = (id: WorkspaceId) => {
    setActiveWorkspace(id);
    if (!onHome) {
      pendingSection.current = id;
      navigate('/');
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className="site-shell">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      {onHome && <motion.div className="scroll-progress" style={{ scaleX: progress }} />}
      <Navbar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={navigateWorkspace}
        onOpenCmd={() => setCmdOpen(true)}
      />
      <main id="main">
        {page === 'case' && caseSlug ? (
          <ProjectCase slug={caseSlug} />
        ) : page === 'index' ? (
          <ProjectsIndex />
        ) : (
          <>
            <HeroDashboard />
            <Projects />
            <Expertise />
            <Experience />
            <Interests />
            <Contact />
          </>
        )}
      </main>
      <CommandPalette
        isOpen={cmdOpen}
        onClose={handleCmdClose}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={navigateWorkspace}
        ledger={ledger}
      />
    </div>
  );
}
