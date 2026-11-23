import { useState } from 'react';
import { profile } from '../data/profile';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail } from './Icons';

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <footer id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap">
        <header className="sec-head reveal">
          <span className="sec-no">05 / Contact</span>
          <h2 id="contact-title">
            If it has to keep telling the truth, <em>let's talk</em>.
          </h2>
          <p>
            {profile.availability}. Recruiters and engineering leads: email is fastest, and a short note about the problem beats a long job description.
          </p>
        </header>

        <div className="contact-actions reveal">
          <a className="btn btn-primary btn-lg" href={`mailto:${profile.email}`}>
            <Mail /> {profile.email}
          </a>
          <button type="button" className="btn btn-lg" onClick={copy} aria-live="polite">
            {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy address'}
          </button>
          <a className="btn btn-lg" href={profile.resume} target="_blank" rel="noreferrer">
            Résumé <ArrowUpRight />
          </a>
        </div>

        <ul className="contact-links reveal">
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Github /> GitHub
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <Linkedin /> LinkedIn
            </a>
          </li>
        </ul>

        <div className="colophon reveal">
          <div>
            <span className="label">About this site</span>
            <p>
              A static React 19 and Vite build with no UI framework and no runtime dependency beyond React. The hero signal is a hand-written canvas simulation with a unit test that pins zero samples lost, the figures are inline SVG, and both themes pass a WCAG AA contrast script.{' '}
              <a href={profile.repo} target="_blank" rel="noreferrer">
                Read the source <ArrowUpRight size={13} />
              </a>
            </p>
          </div>
          <div>
            <span className="label">Shortcuts</span>
            <p>
              <kbd>Ctrl</kbd> <kbd>K</kbd> opens the palette. Try <code>whoami</code>, <code>projects --lang rust</code> or <code>theme light</code>.
            </p>
          </div>
        </div>

        <p className="legal">
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
      </div>
    </footer>
  );
}
