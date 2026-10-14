import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowUpRight, X } from 'lucide-react';
import { WORKSPACES, type WorkspaceId } from '../data/navigation';
import { profile } from '../data/portfolio';
import type { LedgerRow } from '../lib/projects';
import { navigate } from '../lib/router';

interface Command {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
  section?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: WorkspaceId;
  onWorkspaceChange?: (id: WorkspaceId) => void;
  /** The project ledger, so `/projects` and each case sheet are reachable from Cmd+K. */
  ledger?: LedgerRow[];
}

const toast = (message: string) => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 2500);
};

export default function CommandPalette({ isOpen, onClose, onWorkspaceChange, ledger }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const listboxId = 'cmd-results-list';
  const shouldReduceMotion = useReducedMotion();

  const commands: Command[] = useMemo(() => {
    const nav = WORKSPACES.map((ws) => ({
      id: ws.id,
      label: ws.label,
      hint: 'workspace',
      action: () => {
        onWorkspaceChange?.(ws.id);
        onClose();
      },
      section: 'workspaces',
    }));

    return [
      ...nav,
      { id: 'work-index', label: 'work_index', hint: 'route', action: () => { navigate('/projects'); onClose(); }, section: 'routes' },
      { id: 'home-page', label: 'home_page', hint: 'route', action: () => { navigate('/'); onClose(); }, section: 'routes' },
      ...(ledger ?? []).map((row) => ({
        id: `project-${row.slug}`,
        label: `project/${row.slug}`,
        hint: row.status,
        action: () => { navigate(`/projects/${row.slug}`); onClose(); },
        section: 'projects',
      })),
      { id: 'resume', label: 'view_resume', hint: 'external', action: () => { window.open(profile.resume, '_blank'); onClose(); }, section: 'links' },
      { id: 'linkedin', label: 'open_linkedin', hint: 'external', action: () => { window.open(profile.linkedin, '_blank'); onClose(); }, section: 'links' },
      { id: 'github', label: 'open_github', hint: 'external', action: () => { window.open(profile.github, '_blank'); onClose(); }, section: 'links' },
      { id: 'email', label: 'copy_email', hint: 'clipboard', action: async () => { try { await navigator.clipboard.writeText(profile.email); toast(`copied: ${profile.email}`); } catch { toast('copy failed'); } onClose(); }, section: 'actions' },
    ];
  }, [ledger, onClose, onWorkspaceChange]);

  const filtered = commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement;
    setQuery('');
    setActiveIndex(0);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    previousFocus.current?.focus();
    previousFocus.current = null;
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, Math.max(filtered.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [filtered, activeIndex, onClose]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('toggle-cmd-palette'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    const active = resultsRef.current?.children[activeIndex] as HTMLElement;
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleModalKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return;
    const items = modalRef.current?.querySelectorAll<HTMLElement>('input, button, [role="option"]');
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.1 }}
          className="cmd-backdrop"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio navigation"
        >
          <motion.div
            ref={modalRef}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="cmd-modal"
            onKeyDown={handleModalKeyDown}
          >
            <div className="cmd-input-wrapper">
              <span className="cmd-prompt">PS /</span>
              <input
                ref={inputRef}
                type="text"
                className="cmd-input"
                placeholder="Jump to work or open a link..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={filtered[activeIndex] ? `cmd-item-${filtered[activeIndex].id}` : undefined}
                aria-expanded={filtered.length > 0}
              />
              <button type="button" className="cmd-close" onClick={onClose} aria-label="Close portfolio navigation"><X size={18} /></button>
            </div>

            <div id={listboxId} className="cmd-results" ref={resultsRef} role="listbox" aria-label="Portfolio navigation results">
              {filtered.length === 0 ? (
                <div className="cmd-empty">No matching destination</div>
              ) : (
                filtered.map((cmd, i) => (
                  <div
                    key={cmd.id}
                    id={`cmd-item-${cmd.id}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    tabIndex={-1}
                    className={`cmd-result ${i === activeIndex ? 'cmd-result-active' : ''}`}
                    onClick={() => cmd.action()}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="cmd-result-label">{cmd.label}</span>
                    <span className="cmd-result-hint">{cmd.hint}</span>
                  </div>
                ))
              )}
            </div>

            <div className="cmd-footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>esc</kbd> close</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
