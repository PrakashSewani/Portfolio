import { useEffect, useRef, useState } from 'react';
import { profile } from '../../data/profile';
import { useZonedClock } from '../../lib/motion';
import { ArrowUpRight, Check, Copy } from '../Icons';
import LayerMark from '../LayerMark';

/** The email, set large, with a copy button that says whether it worked. */
export default function Contact() {
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef(0);
  const time = useZonedClock(profile.timeZone);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(profile.email);
      setCopy('copied');
    } catch {
      setCopy('failed');
    }
    timer.current = window.setTimeout(() => setCopy('idle'), 2400);
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap contact-inner">
        <header className="sec-head reveal">
          <p className="sec-index label">06 — Contact</p>
          <h2 id="contact-title" className="sec-title contact-title">
            Get in touch
          </h2>
          <p className="sec-lede">
            {profile.availability}. Email is the best way to reach me. I’m in {profile.city}, India (IST, UTC+5:30), where it
            is <time>{time}</time> right now.
          </p>
        </header>

        <div className="channel reveal">
          <a className="channel-email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <div className="channel-actions">
            <button type="button" className={copy === 'copied' ? 'btn btn-signal' : 'btn'} onClick={onCopy}>
              {copy === 'copied' ? <Check /> : <Copy />}
              {copy === 'copied' ? 'Copied' : copy === 'failed' ? 'Copy failed: select it above' : 'Copy address'}
            </button>
            <span className="visually-hidden" role="status">
              {copy === 'copied' ? 'Email address copied to the clipboard' : copy === 'failed' ? 'Could not copy; the address is shown above' : ''}
            </span>
          </div>
        </div>

        <ul className="channel-links reveal">
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              <span className="channel-link-name">GitHub</span>
              <ArrowUpRight size={18} />
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <span className="channel-link-name">LinkedIn</span>
              <ArrowUpRight size={18} />
            </a>
          </li>
          <li>
            <a href={profile.resume} target="_blank" rel="noreferrer">
              <span className="channel-link-name">Résumé</span>
              <ArrowUpRight size={18} />
            </a>
          </li>
          <li>
            <a href={profile.repo} target="_blank" rel="noreferrer">
              <span className="channel-link-name">Site source</span>
              <ArrowUpRight size={18} />
            </a>
          </li>
        </ul>

        <LayerMark size={120} className="contact-mark" />
      </div>
    </section>
  );
}
