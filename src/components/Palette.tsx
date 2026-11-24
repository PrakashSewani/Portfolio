import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { LAYERS } from '../data/layers';
import { SECTIONS, profile } from '../data/profile';
import { STATUS_LABEL, languageCounts, languagesOf, projects, type Project } from '../data/projects';
import { navigate } from '../lib/router';
import { ArrowUpRight, Search } from './Icons';

interface OutputLine {
  text: string;
  href?: string;
}

interface Item {
  id: string;
  label: string;
  hint: string;
  group: string;
  /** Return output lines to show them in the palette and keep it open; return nothing to close. */
  run: () => OutputLine[] | void;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

/** `projects --lang rust --status shipped` → { verb: 'projects', flags: { lang: 'rust', status: 'shipped' } } */
function parseQuery(raw: string) {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const flags: Record<string, string> = {};
  const words: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    if (t.startsWith('--') && tokens[i + 1] && !tokens[i + 1].startsWith('--')) {
      flags[t.slice(2).toLowerCase()] = tokens[i + 1].toLowerCase();
      i += 1;
    } else words.push(t);
  }
  return { verb: (words[0] ?? '').toLowerCase(), flags, words };
}

function matchesFlags(p: Project, flags: Record<string, string>): boolean {
  if (flags.lang && !languagesOf(p).some((l) => l.toLowerCase() === flags.lang || l.toLowerCase().replace('#', 'sharp') === flags.lang)) return false;
  if (flags.layer && !p.layers.some((l) => l === flags.layer)) return false;
  if (flags.status && p.status.replace('-', '') !== flags.status.replace('-', '')) return false;
  return true;
}

/** Ctrl/⌘ K or `/`. Plain search over sections, commands and projects, plus a few typed commands. */
export default function Palette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [output, setOutput] = useState<OutputLine[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const base = useMemo<Item[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
    };
    const openUrl = (url: string) => () => {
      window.open(url, '_blank', 'noopener');
    };
    const langs = languageCounts().map(([lang]) => lang);
    const commands: Item[] = [
      {
        id: 'whoami',
        label: 'whoami',
        hint: 'who built this',
        group: 'Commands',
        run: () => [
          { text: `${profile.name} — ${profile.role}, ${profile.company}` },
          { text: `${profile.location} · IST (UTC+5:30)` },
          { text: `${projects.length} side projects · ${langs.join(' · ')}` },
        ],
      },
      {
        id: 'contact',
        label: 'contact',
        hint: 'email and links',
        group: 'Commands',
        run: () => [
          { text: profile.email, href: `mailto:${profile.email}` },
          { text: 'GitHub', href: profile.github },
          { text: 'LinkedIn', href: profile.linkedin },
          { text: 'Résumé', href: profile.resume },
        ],
      },
      {
        id: 'copy-email',
        label: 'copy email',
        hint: profile.email,
        group: 'Commands',
        run: () => {
          if (!navigator.clipboard) return [{ text: `clipboard unavailable — ${profile.email}`, href: `mailto:${profile.email}` }];
          void navigator.clipboard.writeText(profile.email);
          return [{ text: `copied ${profile.email}` }];
        },
      },
      { id: 'resume', label: 'resume', hint: 'opens in a new tab', group: 'Commands', run: openUrl(profile.resume) },
      { id: 'github', label: 'github', hint: 'opens in a new tab', group: 'Commands', run: openUrl(profile.github) },
      { id: 'linkedin', label: 'linkedin', hint: 'opens in a new tab', group: 'Commands', run: openUrl(profile.linkedin) },
      { id: 'index', label: 'index', hint: 'all projects, with search', group: 'Commands', run: go('/projects') },
      {
        id: 'projects',
        label: 'projects',
        hint: 'try: projects --layer machine',
        group: 'Commands',
        run: () => {
          setQuery('projects ');
          setOutput(null);
          inputRef.current?.focus();
          return [{ text: 'Filter with --layer, --lang, --status. e.g. projects --layer intelligence --status shipped' }];
        },
      },
      {
        id: 'help',
        label: 'help',
        hint: 'what can I type',
        group: 'Commands',
        run: () => [
          { text: 'whoami · contact · copy email · resume · github · linkedin · index' },
          { text: 'projects [--layer machine] [--lang rust] [--status shipped]' },
          { text: 'goto <section>, or just start typing a project name' },
        ],
      },
    ];
    const sections: Item[] = SECTIONS.map((s) => ({
      id: `goto-${s.id}`,
      label: `goto ${s.id}`,
      hint: s.label,
      group: 'Go to',
      run: go(`/#${s.id}`),
    }));
    const layers: Item[] = LAYERS.map((l) => ({
      id: `layer-${l.id}`,
      label: `projects --layer ${l.id}`,
      hint: l.line,
      group: 'Layers',
      run: () => {
        setQuery(`projects --layer ${l.id}`);
        setActive(0);
      },
    }));
    return [...sections, ...commands, ...layers];
  }, []);

  const items = useMemo<Item[]>(() => {
    const projectItem = (p: Project): Item => ({
      id: `project-${p.slug}`,
      label: p.title,
      hint: `${STATUS_LABEL[p.status]}${p.year ? ` · ${p.year}` : ''}`,
      group: 'Projects',
      run: () => navigate(`/projects/${p.slug}`),
    });
    const { verb, flags, words } = parseQuery(query);
    const hasFlags = Object.keys(flags).length > 0;
    if (verb === 'projects' || hasFlags) {
      const text = words.slice(verb === 'projects' ? 1 : 0).join(' ').toLowerCase();
      return projects
        .filter((p) => matchesFlags(p, flags))
        .filter((p) => !text || `${p.title} ${p.stack.join(' ')}`.toLowerCase().includes(text))
        .map(projectItem);
    }
    if (verb === 'goto' || verb === 'cd') {
      const target = words.slice(1).join(' ').toLowerCase();
      return base.filter((i) => i.group === 'Go to' && (!target || i.label.includes(target) || i.hint.toLowerCase().includes(target)));
    }
    const q = query.trim().toLowerCase();
    if (!q) return [...base.filter((i) => i.group === 'Go to'), ...base.filter((i) => i.group === 'Commands'), ...projects.map(projectItem)];
    const hit = (i: Item) => `${i.label} ${i.hint}`.toLowerCase().includes(q);
    return [
      ...base.filter(hit),
      ...projects.filter((p) => `${p.title} ${p.stack.join(' ')} ${p.summary}`.toLowerCase().includes(q)).map(projectItem),
    ];
  }, [query, base]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setOutput(null);
    setActive(0);
    window.setTimeout(() => inputRef.current?.focus(), 0);
    document.documentElement.classList.add('is-locked');
    return () => {
      document.documentElement.classList.remove('is-locked');
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, items]);

  if (!open) return null;

  const runItem = (item: Item | undefined) => {
    if (!item) return;
    const result = item.run();
    if (result && result.length) setOutput(result);
    else onClose();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(items[active]);
    } else if (e.key === 'Tab') {
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('input, a[href], button');
      if (!focusables || !focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  let lastGroup = '';

  return (
    <div className="palette-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search and commands" ref={dialogRef} onKeyDown={onKey}>
        <div className="palette-input">
          <Search size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOutput(null);
            }}
            placeholder="Search projects, or type a command (try whoami)"
            spellCheck={false}
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={items[active] ? `pal-${items[active].id}` : undefined}
            aria-label="Search or command"
          />
          <kbd>Esc</kbd>
        </div>

        {output && (
          <div className="palette-output" role="status">
            {output.map((line) =>
              line.href ? (
                <a key={line.text} href={line.href} target={line.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
                  {line.text} <ArrowUpRight size={13} />
                </a>
              ) : (
                <p key={line.text}>{line.text}</p>
              ),
            )}
          </div>
        )}

        <ul className="palette-list" id="palette-list" role="listbox" aria-label="Results" ref={listRef}>
          {items.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.id} role="presentation">
                {header && <span className="palette-group">{header}</span>}
                <div
                  id={`pal-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  className="palette-item"
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={() => runItem(item)}
                >
                  <span className="palette-label">{item.label}</span>
                  <span className="palette-hint">{item.hint}</span>
                </div>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="palette-empty">
              No match. Try <code>help</code>.
            </li>
          )}
        </ul>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>Enter</kbd> run
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
